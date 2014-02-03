var app = angular.module('PPnet',['ngSanitize','ngAnimate','ngRoute']);

app.controller('AppController', ['$scope', '$location',  function($scope, $location) {

	ImgCache.init(function(){
		  $scope.cache=true;
	}, function(){
		  $scope.cache=false;
	});

	 if (window.location.protocol === "file:" ) {
	 	$scope.phonegap=true;
	 }else{
	 	$scope.phonegap=false;
	 }

	new Database($scope);
	new User($scope);

	if(!$scope.user.isLogedIn()){
		window.location='#/login';
	}

 	$scope.db.changes({
		since:  'latest',
		continuous: true,
		include_docs: true,
		onChange:  function(change) {}
	});
 
 

	
}]);