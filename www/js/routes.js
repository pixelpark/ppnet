app.config(['$routeProvider', function($routeProvider) {
		
	$routeProvider.when('/posting', {
      templateUrl: 'html/posting.html'
    });
    
	$routeProvider.when('/hashtag/:hashtag', {
      templateUrl: 'html/hashtag.html'
    });
    
    $routeProvider.when('/hashtag', {
      templateUrl: 'html/hashtag.html'
    });
     
	$routeProvider.when('/login', {
      templateUrl: 'html/login.html'
    });

    $routeProvider.when('/user/:task', {
      controller: 'UserController',
      template : ''
    });
    
    $routeProvider.when('/json', {
       templateUrl: 'html/json.html'
    });

    $routeProvider.when('/auth', {
        controller: 'AuthController',
        templateUrl: 'html/auth.html'
    });

    $routeProvider.otherwise({
      templateUrl: 'html/posting.html'
    });
    
}]); 

