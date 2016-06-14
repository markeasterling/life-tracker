angular.module("life", [])
	.config(() => (
		firebase.initializeApp({
    apiKey: "AIzaSyD-tzA7TfGK1BW2OkIajK0jb8CBibYpXW0",
    authDomain: "life-tracker-e5c81.firebaseapp.com",
    databaseURL: "https://life-tracker-e5c81.firebaseio.com",
    storageBucket: "life-tracker-e5c81.appspot.com",
  })))

  .controller("MainCtrl", function($http){
  	main = this;
  	main.heading = "Lifetracker";
    main.goals=[]

  	main.submitGoal = function(){
  		// console.log(main.goalTitle)
  		// console.log(main.goalDescription)
  		// console.log(main.goalPoints)
  		// console.log(main.goalLength)
    //   console.log(main.goalImportance)
    //   console.log(main.goalCategory)
      firebase.database().ref('/goals/').push({
        "title": main.goalTitle,
        "description": main.goalDescription,
        "points": main.goalPoints,
        "length": main.goalLength,
        "importance": main.goalImportance,
        "category": main.goalCategory
      })

      // main.goals.push({
      //   "title": main.goalTitle,
      //   "description": main.goalDescription,
      //   "points": main.goalPoints,
      //   "length": main.goalLength,
      //   "importance": main.goalImportance,
      //   "category": main.goalCategory
      // })
      // console.log(main.goals)
  	};


  });
