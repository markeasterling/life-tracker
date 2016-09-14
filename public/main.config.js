app.config(($routeProvider) => (
    $routeProvider
      .when("/", {
        templateUrl: "templates/login.html"
      })
      .when("/main", {
        templateUrl: "templates/main.html"
      })
))
