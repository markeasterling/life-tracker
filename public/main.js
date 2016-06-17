angular.module("life", ['angular.filter'])
	.config(() => (
		firebase.initializeApp({
    apiKey: "AIzaSyD-tzA7TfGK1BW2OkIajK0jb8CBibYpXW0",
    authDomain: "life-tracker-e5c81.firebaseapp.com",
    databaseURL: "https://life-tracker-e5c81.firebaseio.com",
    storageBucket: "life-tracker-e5c81.appspot.com",
  })))


  .controller("MainCtrl", function($timeout, $scope){
    main = this;
    main.heading = "Lifetracker";
    //main.currentUserId= "zS0MHocQRcWgB14PmyH6VvP085I2"
    //let currentUserId;
    //$scope.currentUserId = userId


  const setCurrentTime = () => {
    firebase.database().ref('/time/')
      .update({"currentTime": Date.now()})
      //console.log(currentUserId)
  };
  setCurrentTime();

//NOT SURE ABOUT THIS PART/////
  const updateTime = snapshot => (
    $timeout().then(() => (
      main.time = Object.assign(
        {},
        main.time,
        { [snapshot.key]: snapshot.val() }
      )
    ))
  )
/////////////////////////////

  const updateGoals = (snapshot) => (
    $timeout().then(() => (
      main.goals = Object.assign(
        {},
        main.goals,
        { [snapshot.key]: snapshot.val() }
        )
      ))
    );

  main.completeGoal = function (key) {
    console.log(key)
    return firebase.database().ref(`/goals/${key}`)
      .transaction(goal => {
        goal.complete = true
        return goal
      })
  };

  main.showGoal = function (key) {
    console.log(key)
    let current=main.goals[key]
    console.log(current)
    goalDisplay = `<div>Title: ${current.title}</div>`
  };

  main.submitGoal = function () {
    let start = Date.now()
    let end = start + main.goalLength * 86400000

    firebase.database().ref('/goals/').push({
      "title": main.goalTitle,
      "description": main.goalDescription,
      "points": main.goalPoints,
      "length": main.goalLength,
      "importance": main.goalImportance,
      "category": main.goalCategory,
      "complete": false,
      "dateStarted": start,
      "dateEnded": end,
      "userId": main.currentUserId
    })
      setCurrentTime();
      console.log(main.time)
	};

  main.login = function (email, password) {
    console.log(email);
    console.log(password);
    firebase.auth().signInWithEmailAndPassword(email, password)
  };

  main.reset = function () {
    firebase.database().ref('/time/').once('value').then(function(snapshot) {
      main.time = snapshot.val()
      console.log("main.time:", main.time)

      if (main.time.currentTime > main.time.inceptionTime) {
        console.log(true)
      } else {
        console.log(false)
      }

    })
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        // console.log("user id", user.uid)
        // console.log(user.getToken())
        console.log(user.email)
        main.currentUserId = user.uid
        main.currentUserEmail= user.email


    }
  })




    firebase.database().ref('/goals/').on('child_added', updateGoals)
    firebase.database().ref('/goals/').on('child_changed', updateGoals)
   /////////////////NOT SURE ABOUT THIS////////////
    firebase.database().ref('/time/').on('child_changed', updateTime)
   /////////////////////////////////////////////////
  });
