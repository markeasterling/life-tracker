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
    let userId;


  const setCurrentTime = () => {
    firebase.database().ref('/time/')
      .update({"currentTime": Date.now()})
      //console.log(Date.now())
  };
  setCurrentTime();

//NOT SURE ABOUT THIS PART/////
  // const updateTime = snapshot => (
  //   $timeout().then(() => (
  //     main.time = Object.assign(
  //       {},
  //       main.time,
  //       { [snapshot.key]: snapshot.val()}
  //     )
  //   )).then(console.log(main.time.currentTime))
  // )
///////////////////////////////

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
      "userId": userId
    })
      console.log(userId)
      setCurrentTime();
	};

  main.login = function (email, password) {
    console.log(email);
    console.log(password);
    firebase.auth().signInWithEmailAndPassword(email, password)
  };

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("user id", user.uid)
        console.log(user.getToken())
        userId = user.uid

    }
  })

    firebase.database().ref('/goals/').on('child_added', updateGoals)
    firebase.database().ref('/goals/').on('child_changed', updateGoals)
   /////////////////NOT SURE ABOUT THIS////////////
    //firebase.database().ref('/time/').on('child_changed', updateTime)
   /////////////////////////////////////////////////
  });
