var app = angular.module('PPnet',['ngSanitize','ngAnimate','ngRoute']);

app.controller('AppController', ['$scope', '$location',  function($scope, $location) {

	new Database($scope);
	new User($scope);
	
	console.log('Logedin: '+$scope.user.isLogedIn());
	if(!$scope.user.isLogedIn()){
		window.location='#/login';
	}

 	$scope.db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {

					  }
	});
 
}]);