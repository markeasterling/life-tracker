var app = angular
  .module("life", ['angular.filter', 'ngRoute'])
	.config(() => (
		firebase.initializeApp({
    apiKey: "AIzaSyD-tzA7TfGK1BW2OkIajK0jb8CBibYpXW0",
    authDomain: "life-tracker-e5c81.firebaseapp.com",
    databaseURL: "https://life-tracker-e5c81.firebaseio.com",
    storageBucket: "life-tracker-e5c81.appspot.com",
  })))
  .controller("MainCtrl", function($timeout, $scope, $location){
    main = this;
    main.heading = "Lifetracker";
    main.loginHeader = "login";

  // sets the current time in firebase. This time is compared to the inceptionTime (also in firebase
  //to see if the goals need to be reset.
  const setCurrentTime = () => {
    firebase.database().ref('/time/')
      .update({"currentTime": Date.now()})
  }

  // allows updating of time in firebase when a goal object is added or deleted.
  const updateTime = snapshot => (
    $timeout().then(() => (
      main.time = Object.assign(
        {},
        main.time,
        { [snapshot.key]: snapshot.val() }
      )
    ))
  )

  //updates main.goals(an object containing all goals) whenever a goal is added, deleted, or changed
  const updateGoals = (snapshot) => (
    $timeout().then(() => (
      main.goals = Object.assign(
        {},
        main.goals,
        { [snapshot.key]: snapshot.val() }
      )
    ))
  )

  // whenever a goal is marked "complete", a true value is pushed to the firebase goal object's records,
  // which is a collection of trues or falses used for calculating the total completedness
  main.completeGoal = function (key) {
    return firebase.database().ref(`/goals/${key}`)
      .transaction(goal => {
        goal.complete = true;
        goal.record.push(true);
        return goal
      })
  };

  // deletes goal object from firebase
  main.deleteGoal = function (key) {
    firebase.database().ref(`/goals/${key}`).remove();
  }

  // creates firebase goal object from form data. updates current time
  main.submitGoal = function () {
    firebase.database().ref('/goals/').push(
      {
      "title": main.goalTitle,
      "description": main.goalDescription,
      "importance": main.goalImportance,
      "category": main.goalCategory,
      "frequency": main.goalFrequency,
      "complete": false,
      "record": ["true"],
      "percentComplete": 0,
      "userId": main.currentUserId
      }
    )
      main.goalTitle = "";
      main.goalDescription = "";
      main.goalImportance = "";
      main.goalCategory = "";
      main.goalFrequency = "";
      setCurrentTime();
	}

  // authentication with firebase methods (existing user)
  main.login = function (email, password) {
    firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {main.switchToMain()})
  }

  //account creation and authentication with firebase methods (new user)
	main.register = function (email, password) {
		firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {firebase.auth().signInWithEmailAndPassword(email, password)})
    .then(() => {main.switchToMain()})
	}

  // log out of current account and redirect to login page
  main.logout = function () {
    firebase.auth().signOut().then(function(){console.log("sign out success");
    })
    main.currentUserId = undefined;
    $location.path('/');
  }

  // redirect to main goal page
  main.switchToMain = function () {
      $timeout().then(() => {$location.path("/main");})
  }

  // function that "resets" the clock and records completedness of all goals for that day
  main.reset = function () {
    // save current time
    firebase.database().ref('/time/').once('value').then(function(snapshot) {
      main.time = snapshot.val();

      //compares curent time to inception time. inception time was set when the application
      //was created, and is updated every time a day has passed
      if (main.time.currentTime > main.time.inceptionTime) {
        let goals = main.goals;
        firebase.database().ref(`/time/`)
              .transaction(time => {
                time.inceptionTime = time.inceptionTime + 86400000; //86400000ms= 24hrs
                return time
              })

        // updates all goal objects in firebase      
        for (obj in goals) {
          if (goals[obj].complete == true) {
            firebase.database().ref(`/goals/${obj}`)
              .transaction(goal => {
                function numberTrue(value){
                  return value == true
                }
                let trues = goal.record.filter(numberTrue)
                goal.complete = false;
                goal.percentComplete = Math.round((trues.length / (goal.record.length - 1)) * 100);
                return goal
              })

          } else {
            firebase.database().ref(`/goals/${obj}`)
              .transaction(goal => {
                function numberTrue(value){
                  return value == true
                }
                let trues = goal.record.filter(numberTrue);
                goal.record.push(goal.complete);
                goal.complete = false;
                goal.percentComplete = Math.round((trues.length / (goal.record.length - 1)) * 100);
                return goal
              })
          }
        }
      } else {
        console.log("a day has not passed yet");
      }
   })
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        main.currentUserId = user.uid;
        main.currentUserEmail= user.email;
    }
  })

  main.loadCharts = function() {
    main.loadAllGoals = function () {
      let goals = main.goals;
      let allGoals = { "goals": []}
      for ( obj in goals ) {
        if ( goals[obj].userId == main.currentUserId ) {
          let goalobj = {
            "label": goals[obj].title,
            "n": goals[obj].percentComplete
          };
          allGoals.goals.push(goalobj);
        } else {
          console.log(false);
        }
      }

      d3.select(".allGoalsChart")
        .selectAll("div")
          .data(allGoals.goals)
            .enter().append("div")
              .style("width", function(d) { return d.n * 4 + "px"; })
                .text(function(d) { return `${d.label}- ${Math.floor(d.n)}%` });
    }

    main.loadCategorizedGoals = function () {
      let goals = main.goals;
      let catObj = { "goals": [] };
      let physicalArray = [];
      let workArray = [];
      let personalArray = [];
      let physicalObj;
      let workObj;
      let personalObj;

      for (obj in goals) {
        if (goals[obj].category == "physical" && goals[obj].userId == main.currentUserId) {
          physicalArray.push(goals[obj].percentComplete)
          let percentArray = physicalArray.reduce((a, b) => a + b, 0);
          let avg = percentArray/physicalArray.length;
          physicalObj = {
            "label": "physical",
            "n": avg
          };
        } else if (goals[obj].category == "work" && goals[obj].userId == main.currentUserId) {
          workArray.push(goals[obj].percentComplete);
          let percentArray = workArray.reduce((a, b) => a + b, 0);
          let avg = percentArray/workArray.length;
          workObj = {
            "label": "work",
            "n": avg
          };
        } else if (goals[obj].category == "personal" && goals[obj].userId == main.currentUserId) {
          personalArray.push(goals[obj].percentComplete);
          let percentArray = personalArray.reduce((a, b) => a + b, 0);
          let avg = percentArray/personalArray.length;
          personalObj = {
            "label": "personal",
            "n": avg
          };
        }
      }

			if (physicalObj){
				catObj.goals.push(physicalObj);
			} else {
				console.log("physicalObj does not exist");
			}

      if (workObj){
				catObj.goals.push(workObj);
			} else {
				console.log("workObj does not exist");
			}

      if (personalObj){
				catObj.goals.push(personalObj);
			} else {
				console.log("personalObj does not exist");
			}

      d3.select(".categoriesChart")
        .selectAll("div")
          .data(catObj.goals)
            .enter().append("div")
              .style("width", function(d) { return d.n * 4 + "px"; })
                .text(function(d) { return `${d.label}- ${Math.floor(d.n)}%` });
    }

    main.loadPriorityGoals = function () {
      let goals = main.goals;
      let priorityObj = { "goals": [] };
      let lowArray = [];
      let normalArray = [];
      let highArray = [];
      let lowObj;
      let normalObj;
      let highObj;

      for (obj in goals) {
        if (goals[obj].importance == "low" && goals[obj].userId == main.currentUserId) {
          lowArray.push(goals[obj].percentComplete);
          let percentArray = lowArray.reduce((a, b) => a + b, 0);
          let avg = percentArray/lowArray.length;
          lowObj = {
            "label": "low",
            "n": avg
          };
        } else if (goals[obj].importance == "normal" && goals[obj].userId == main.currentUserId) {
          normalArray.push(goals[obj].percentComplete)
          let percentArray = normalArray.reduce((a, b) => a + b, 0);
          let avg = percentArray/normalArray.length;
          normalObj = {
            "label": "normal",
            "n": avg
          };
        } else if (goals[obj].importance == "high" && goals[obj].userId == main.currentUserId) {
          highArray.push(goals[obj].percentComplete);
          let percentArray = highArray.reduce((a, b) => a + b, 0);
          let avg = percentArray/highArray.length;
          highObj = {
            "label": "high",
            "n": avg
          };
        }
      }

			if (lowObj){
				priorityObj.goals.push(lowObj);
			} else {
				console.log("lowObj does not exist");
			}

			if (normalObj){
				priorityObj.goals.push(normalObj);
			} else {
				console.log("normalObj does not exist");
			}

			if (highObj){
				priorityObj.goals.push(highObj);
			} else {
				console.log("highObj does not exist");
			}

      d3.select(".priorityChart")
        .selectAll("div")
          .data(priorityObj.goals)
            .enter().append("div")
              .style("width", function(d) { return d.n * 4 + "px"; })
                .text(function(d) { return `${d.label} priority- ${Math.floor(d.n)}%` });
    }
    main.loadAllGoals();
    main.loadPriorityGoals();
    main.loadCategorizedGoals();
  }
  setCurrentTime();
  firebase.database().ref('/goals/').on('child_added', updateGoals);
  firebase.database().ref('/goals/').on('child_changed', updateGoals);
  firebase.database().ref('/goals/').on('child_removed', updateGoals);
  firebase.database().ref('/time/').on('child_changed', updateTime);
  });
