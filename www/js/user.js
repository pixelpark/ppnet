app.controller('UserController', function($scope, $routeParams, $location) {
	$scope.showMenu=false;
	
	
	if ($routeParams.task=='logout'){
		$scope.user.name=null;
		$scope.user.id=null;
		$scope.user.admin=null;
		window.localStorage.setItem("user.name", $scope.user.name);
		window.localStorage.setItem("user.id", $scope.user.id);
		window.localStorage.setItem("user.admin", $scope.user.admin);
		window.location='#/login';
	}
	
	if ($routeParams.task=='login'){
		window.localStorage.setItem("user.name", $scope.user.name);
		window.localStorage.setItem("user.id", $scope.user.id);
		window.location='#/posting';
	}

});	
	
	
function User($scope){
	$scope.user = {vars:{}};
	$scope.user.id = window.localStorage.getItem("user.id");
	$scope.user.name = window.localStorage.getItem("user.name");
	$scope.user.admin = window.localStorage.getItem("user.admin");
	$scope.user.setAdmin=function (status){
		if(status){
			window.localStorage.setItem("user.admin", true);
			$scope.user.admin=true;	
		}else{
			window.localStorage.setItem("user.admin", false);
			$scope.user.admin=false;	
		}
	};
	$scope.user.login = function(){
		if($scope.user.name && $scope.user.id){
			 window.location='#/user/login';
		}else{
			
		}
	};
	$scope.user.isLogedIn = function(){
		return (window.localStorage.getItem("user.id"))?true:false;
	};
	$scope.user.getName = function(){
		return $scope.user.name;
	};
	$scope.user.getId = function(){
		return $scope.user.id;
	};
}