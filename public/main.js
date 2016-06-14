angular.module("life", [])
	.config(() => (
		firebase.initializeApp({
    apiKey: "AIzaSyD-tzA7TfGK1BW2OkIajK0jb8CBibYpXW0",
    authDomain: "life-tracker-e5c81.firebaseapp.com",
    databaseURL: "https://life-tracker-e5c81.firebaseio.com",
    storageBucket: "life-tracker-e5c81.appspot.com",
  })))

  .controller("MainCtrl", function(){
  	main = this;
  	main.heading = "Lifetracker";

  	main.submitGoal = function(){
  		console.log(main.goalTitle)
  		console.log(main.goalDescription)
  		console.log(main.goalPoints)
  		console.log(main.goalLength)
      console.log(main.goalImportance)
      console.log(main.goalCategory)


  	};


  });
