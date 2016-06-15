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


  const setCurrentTime = () => {
    firebase.database().ref('/time/')
      .set({"current time": Date.now()})
      console.log(Date.now())
  };
  setCurrentTime();

  const updateGoals = (snapshot) => (
    $timeout().then(()=> (
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

    main.submitGoal = function (){
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
        "dateEnded": end
      })

  	};

    firebase.database().ref('/goals/').on('child_added', updateGoals)
    firebase.database().ref('/goals/').on('child_changed', updateGoals)
  });
