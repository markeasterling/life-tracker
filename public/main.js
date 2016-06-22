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



  // let sortedData = firebase.database().ref(`/goals/`).orderByChild('percentComplete');
  // console.log(sortedData)

//     var w = 500,
//         h = 100;

//     var svg = d3.select(".chart")
//       .append("svg")
//       .attr("width", w)
//       .attr("height", h);

//     d3.json("bars.json", function(json) {

//       var data = dataz.items

//       var max_n = 0;
//       for (var d in data) {
//         max_n = Math.max(data[d].n, max_n);
//       }

//       var dx = w / max_n;
//       var dy = h / data.length;

//       // bars
//       var bars = svg.selectAll(".bar")
//         .data(data)
//         .enter()
//         .append("rect")
//         .attr("class", function(d, i) {return "bar " + d.label;})
//         .attr("x", function(d, i) {return 0;})
//         .attr("y", function(d, i) {return dy*i;})
//         .attr("width", function(d, i) {return dx*d.n})
//         .attr("height", dy)
//         .style("color", "green");

//       // labels
//       var text = svg.selectAll("text")
//         .data(data)
//         .enter()
//         .append("text")
//         .attr("class", function(d, i) {return "label " + d.label;})
//         .attr("x", 5)
//         .attr("y", function(d, i) {return dy*i + 15;})
//         .text( function(d) {return d.label + " " + d.n  + "%";})
//         .attr("font-size", "15px")
//         .style("font-weight", "bold")
//         .style("color", "white");
//     });

//     let dataz = {
//   "items": [
//     {
//       "label": "ride bike",
//       "n": 20
//     },
//     {
//       "label": "oranges",
//       "n": 79
//     },
//     {
//       "label": "bananas",
//       "n": 10
//     },
//     {
//       "label": "plums",
//       "n": 5
//     },
//   ]
// }
// console.log(dataz.items)
main.loadGoals = function () {
  console.log(main.currentUserId)
  let goals = main.goals
  let d3Obj = { "goals": []}
  for ( obj in goals ) {
    if ( goals[obj].userId == main.currentUserId ) {
      let goalobj = {
        "label": goals[obj].title,
        "n": goals[obj].percentComplete
      }
      d3Obj.goals.push(goalobj)
      // console.log(goalobj)
      console.log(d3Obj)
    } else {
      console.log(false)
    }
  }


   var w = 500,
        h = 100;

    var svg = d3.select(".chart")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    d3.json("bars.json", function(json) {

      var data = d3Obj.goals

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
        .attr("width", function(d, i) {return 10*d.n})
        .attr("height", dy)
        .style("color", "green");

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
        .style("font-weight", "bold")
        .style("color", "white");
    });

    let dataz = {
  "items": [
    {
      "label": "ride bike",
      "n": 20
    },
    {
      "label": "oranges",
      "n": 79
    },
    {
      "label": "bananas",
      "n": 10
    },
    {
      "label": "plums",
      "n": 5
    },
  ]
}
}



    firebase.database().ref('/goals/').on('child_added', updateGoals)
    firebase.database().ref('/goals/').on('child_changed', updateGoals)
   /////////////////NOT SURE ABOUT THIS////////////
    firebase.database().ref('/time/').on('child_changed', updateTime)
   /////////////////////////////////////////////////
  });
