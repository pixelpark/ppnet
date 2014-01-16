function User($scope){	
	/*
     *  USER
     */
    //window.localStorage.clear();
    console.log('init');
	$scope.user = {vars:{}};
	$scope.user.id = window.localStorage.getItem("user.id");
	$scope.user.name = window.localStorage.getItem("user.name");
	
	$scope.user.isLogedIn = function(){
		return (window.localStorage.getItem("user.id"))?true:false;
	};
	
	$scope.user.login = function(){
		if($scope.user.name && $scope.user.id){
			 window.localStorage.setItem("user.name", $scope.user.name);
			 window.localStorage.setItem("user.id", $scope.user.id);
			 window.location='./main.html';
		}else{
			
		}
	};
	
	$scope.user.logout = function(){
		window.localStorage.clear();
		window.location='./main.html';
	};
	
	$scope.user.getName = function(){
		return $scope.user.name;
	};
	$scope.user.getId = function(){
		return $scope.user.id;
	};
}