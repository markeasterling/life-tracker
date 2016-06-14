angular.module("life", ['angular.filter'])
	.config(() => (
		firebase.initializeApp({
    apiKey: "AIzaSyD-tzA7TfGK1BW2OkIajK0jb8CBibYpXW0",
    authDomain: "life-tracker-e5c81.firebaseapp.com",
    databaseURL: "https://life-tracker-e5c81.firebaseio.com",
    storageBucket: "life-tracker-e5c81.appspot.com",
  })))


  .controller("MainCtrl", function($timeout){
    main = this;
    main.heading = "Lifetracker";

  const updateGoals = (snapshot) => (
    $timeout().then(()=> (
      main.goals = Object.assign(
        {},
        main.goals,
        { [snapshot.key]: snapshot.val() }
        )
      ))
    )

    main.completeGoal = function (key) {
      console.log(key)
      return firebase.database().ref(`/goals/${key}`)
        .transaction(goal => {
          goal.complete = true
          return goal
        })
    }

    main.submitGoal = function (){

      firebase.database().ref('/goals/').push({
        "title": main.goalTitle,
        "description": main.goalDescription,
        "points": main.goalPoints,
        "length": main.goalLength,
        "importance": main.goalImportance,
        "category": main.goalCategory,
        "complete": false
      })

  	};

    firebase.database().ref('/goals/').on('child_added', updateGoals)
    firebase.database().ref('/goals/').on('child_changed', updateGoals)
  });
