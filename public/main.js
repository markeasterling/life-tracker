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
        goal.record.push(true)
        return goal
      })
  };

  main.deleteGoal = function (key) {
    firebase.database().ref(`/goals/${key}`).remove()
  }
//////non functioning///
  // main.showGoal = function (key) {
  //   console.log(key)
  //   let current=main.goals[key]
  //   console.log(current)
  //   goalDisplay = `<div>Title: ${current.title}</div>`
  // };
/////////////////////
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
      "record": ["true"],
      "percentComplete": 0,
      "userId": main.currentUserId
    })
      setCurrentTime();
      //console.log(main.time)
	};

  main.login = function (email, password) {
    console.log(email);
    console.log(password);
    firebase.auth().signInWithEmailAndPassword(email, password)
  };

  main.reset = function () {
    firebase.database().ref('/time/').once('value').then(function(snapshot) {
      main.time = snapshot.val()
      //console.log("main.time:", main.time)

      if (main.time.currentTime > main.time.inceptionTime) {
        //console.log(true)
        let goals = main.goals
        //let time = main.time
        firebase.database().ref(`/time/`)
              .transaction(time => {
                time.inceptionTime = time.inceptionTime + 1 // 86400000
                return time
              })


        for (obj in goals) {

          console.log("for:", goals[obj])
          if (goals[obj].complete == true) {
            //console.log("that goal has been completed")
            firebase.database().ref(`/goals/${obj}`)
              .transaction(goal => {
                function numberTrue(value){
                  return value == true
                }
                let trues = goal.record.filter(numberTrue)

                //goal.record.push(goal.complete)
                goal.complete = false
                goal.percentComplete = Math.round((trues.length / (goal.record.length - 1)) * 100)
                console.log("true trues",trues.length)
                console.log("true total",goal.record.length)
                return goal
              })
                //console.log(goal.record)
          } else {
            // console.log("that goal has not been completed")
            //goals[obj].record.push(false)
            firebase.database().ref(`/goals/${obj}`)
              .transaction(goal => {
                function numberTrue(value){
                  return value == true
                }
                let trues = goal.record.filter(numberTrue)

                goal.record.push(goal.complete)
                goal.complete = false
                goal.percentComplete = Math.round((trues.length / (goal.record.length - 1)) * 100)
                console.log("false trues",trues.length)
                console.log("false total",goal.record.length)
                return goal
              })
          }
        }
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

main.loadAllGoals = function () {
  //console.log(main.currentUserId)
  let goals = main.goals
  let allGoals = { "goals": []}
  for ( obj in goals ) {
    if ( goals[obj].userId == main.currentUserId ) {
      let goalobj = {
        "label": goals[obj].title,
        "n": goals[obj].percentComplete
      }
      allGoals.goals.push(goalobj)
      // console.log(goalobj)
      //console.log(allGoals)
    } else {
      console.log(false)
    }
  }


   var w = 500;
       //h = data.length * 20;

    var svg = d3.select(".allGoalsChart")
      .append("svg")
      .attr("width", w)
      //.attr("height", h);


      var data = allGoals.goals;
      var h = data.length * 22;
      var max_n = 0;
      for (var d in data) {
        max_n = Math.max(data[d].n, max_n);
      }

      var dx = w / max_n;
      var dy = h / data.length;

      // bars
      var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", function(d, i) {return "bar " + d.label;})
        .attr("x", function(d, i) {return 0;})
        .attr("y", function(d, i) {return dy*i;})
        .attr("width", function(d, i) {return 6*d.n})
        .attr("height", 20)

      // labels
      var text = svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("class", function(d, i) {return "label " + d.label;})
        .attr("x", 5)
        .attr("y", function(d, i) {return dy*i + 15;})
        .text( function(d) {return d.label + " " + d.n  + "%";})
        .attr("font-size", "15px")

}

  main.loadCategorizedGoals = function () {
    let goals = main.goals;
    let catObj = { "goals": [] };
    let physicalArray = [];
    let workArray = [];
    let personalArray = [];
    let physicalObj
    let workObj
    let personalObj


    for (obj in goals) {
      if (goals[obj].category == "physical" && goals[obj].userId == main.currentUserId) {
        physicalArray.push(goals[obj].percentComplete)
        let percentArray = physicalArray.reduce((a, b) => a + b, 0);
        let avg = percentArray/physicalArray.length
        console.log(avg)
        console.log(physicalArray)
        physicalObj = {
          "label": "physical",
          "n": avg
        }
      } else if (goals[obj].category == "work" && goals[obj].userId == main.currentUserId) {
        workArray.push(goals[obj].percentComplete)
        let percentArray = workArray.reduce((a, b) => a + b, 0);
        let avg = percentArray/workArray.length
        console.log(avg)
        console.log(workArray)
        workObj = {
          "label": "work",
          "n": avg
        }
      } else if (goals[obj].category == "personal" && goals[obj].userId == main.currentUserId) {
        personalArray.push(goals[obj].percentComplete)
        let percentArray = personalArray.reduce((a, b) => a + b, 0);
        let avg = percentArray/personalArray.length
        console.log(avg)
        console.log(personalArray)
        personalObj = {
          "label": "personal",
          "n": avg
        }
      }
    }
    catObj.goals.push(physicalObj)
    catObj.goals.push(workObj)
    catObj.goals.push(personalObj)
    console.log(catObj)

    var w = 500;
       //h = data.length * 20;

    var svg = d3.select(".categoriesChart")
      .append("svg")
      .attr("width", w)
      //.attr("height", h);


      var data = catObj.goals;
      var h = data.length * 22;
      var max_n = 0;
      for (var d in data) {
        max_n = Math.max(data[d].n, max_n);
      }

      var dx = w / max_n;
      var dy = h / data.length;

      // bars
      var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", function(d, i) {return "bar " + d.label;})
        .attr("x", function(d, i) {return 0;})
        .attr("y", function(d, i) {return dy*i;})
        .attr("width", function(d, i) {return 6*d.n})
        .attr("height", 20)

      // labels
      var text = svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("class", function(d, i) {return "label " + d.label;})
        .attr("x", 5)
        .attr("y", function(d, i) {return dy*i + 15;})
        .text( function(d) {return d.label + " " + d.n  + "%";})
        .attr("font-size", "15px")

  }

  main.loadPriorityGoals = function () {
    let goals = main.goals;
    let priorityObj = { "goals": [] };
    let lowArray = [];
    let normalArray = [];
    let highArray = [];
    let lowObj
    let normalObj
    let highObj


    for (obj in goals) {
      if (goals[obj].importance == "low" && goals[obj].userId == main.currentUserId) {
        lowArray.push(goals[obj].percentComplete)
        let percentArray = lowArray.reduce((a, b) => a + b, 0);
        let avg = percentArray/lowArray.length
        console.log(avg)
        console.log(lowArray)
        lowObj = {
          "label": "low",
          "n": avg
        }
      } else if (goals[obj].importance == "normal" && goals[obj].userId == main.currentUserId) {
        normalArray.push(goals[obj].percentComplete)
        let percentArray = normalArray.reduce((a, b) => a + b, 0);
        let avg = percentArray/normalArray.length
        console.log(avg)
        console.log(normalArray)
        normalObj = {
          "label": "normal",
          "n": avg
        }
      } else if (goals[obj].importance == "high" && goals[obj].userId == main.currentUserId) {
        highArray.push(goals[obj].percentComplete)
        let percentArray = highArray.reduce((a, b) => a + b, 0);
        let avg = percentArray/highArray.length
        console.log(avg)
        console.log(highArray)
        highObj = {
          "label": "high",
          "n": avg
        }
      }
    }
    priorityObj.goals.push(lowObj)
    priorityObj.goals.push(normalObj)
    priorityObj.goals.push(highObj)
    console.log(priorityObj)

    var w = 500;
       //h = data.length * 20;

    var svg = d3.select(".categoriesChart")
      .append("svg")
      .attr("width", w)
      //.attr("height", h);


      var data = priorityObj.goals;
      var h = data.length * 22;
      var max_n = 0;
      for (var d in data) {
        max_n = Math.max(data[d].n, max_n);
      }

      var dx = w / max_n;
      var dy = h / data.length;

      // bars
      var bars = svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", function(d, i) {return "bar " + d.label;})
        .attr("x", function(d, i) {return 0;})
        .attr("y", function(d, i) {return dy*i;})
        .attr("width", function(d, i) {return 6*d.n})
        .attr("height", 20)

      // labels
      var text = svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("class", function(d, i) {return "label " + d.label;})
        .attr("x", 5)
        .attr("y", function(d, i) {return dy*i + 15;})
        .text( function(d) {return d.label + " " + d.n  + "%";})
        .attr("font-size", "15px")

  }



  firebase.database().ref('/goals/').on('child_added', updateGoals)
  firebase.database().ref('/goals/').on('child_changed', updateGoals)
  firebase.database().ref('/goals/').on('child_removed', updateGoals)
    // firebase.database().ref('/goals/').on('child_moved', updateGoals)
   /////////////////NOT SURE ABOUT THIS////////////
    firebase.database().ref('/time/').on('child_changed', updateTime)
   /////////////////////////////////////////////////
  });
