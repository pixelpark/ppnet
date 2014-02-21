app.config(['$routeProvider', function($routeProvider) {
		
	$routeProvider.when('/posting', {
	  controller: 'PostingController',
      templateUrl: 'html/views/posting.html'
    });
    
	$routeProvider.when('/hashtag/:hashtag', {
      templateUrl: 'html/views/hashtag.html'
    });
    
    $routeProvider.when('/hashtag', {
      templateUrl: 'html/views/hashtag.html'
    });
     
	$routeProvider.when('/login', {
      templateUrl: 'html/views/login.html'
    });

    $routeProvider.when('/user/:task', {
      controller: 'UserController',
      template : ''
    });
    
    $routeProvider.when('/view/:view', {
      controller: 'ViewController',
      templateUrl:function(params) {return "html/views/" + params.view +'.html';}
    });

    $routeProvider.when('/auth', {
        controller: 'AuthController',
        templateUrl: 'html/views/auth.html'
    });

    $routeProvider.otherwise({
    	controller: 'PostingController',
      templateUrl: 'html/views/posting.html'
    });
    
}]); 

