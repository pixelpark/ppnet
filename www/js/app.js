var app = angular.module('PPnet',['ngSanitize','ngAnimate','ngRoute']);

app.controller('AppController', ['$scope', function($scope) {
//function AppController($scope) {
 	new Database($scope);
	new User($scope);
 	
 	$scope.db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {

					  }
	});
 
}]);