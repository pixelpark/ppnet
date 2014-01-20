app.config(['$routeProvider', function($routeProvider) {
	
	
	$routeProvider.when('/posting', {
      templateUrl: 'html/posting.html'
    });

	$routeProvider.when('/login', {
      templateUrl: 'html/login.html'
    });


    
    $routeProvider.when('/user/:task', {
      controller: 'UserController',
      template : ''
    });
    

    
    $routeProvider.otherwise({redirectTo: '/posting'});
    
}]); 

