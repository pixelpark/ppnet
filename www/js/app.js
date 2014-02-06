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
	
	$scope.global_functions={};
	
	
	
	if(window.localStorage.getItem("itemsToPush"))
 		$scope.itemsToPush= JSON.parse(window.localStorage.getItem("itemsToPush"));
 	else
 		$scope.itemsToPush=new Array(); 	
	$scope.$watch(
		function(){return $scope.global_functions.countItems();},
		function(newValue, oldValue) {
			if(newValue>0){
				$scope.global_functions.toReplicate();
			}
		}
	);
	$scope.global_functions.toReplicate = function(){
		console.log('START: toReplicate - '+ $scope.itemsToPush[0]);
		args = {
			doc_ids: $scope.itemsToPush, 
			complete: function(err,result){
				if(!err){
					console.log('FINISH: toReplicate - '+ $scope.itemsToPush[0]);
					$scope.itemsToPush=new Array();
					$scope.$apply();
				}else{
					//console.log('ERROR: toReplicate - '+ $scope.itemsToPush[0]);
				}
				console.log($scope.itemsToPush);
			}
		};
		$scope.db.replicate.to($scope.remoteCouch, args);
		;
	};

 	$scope.global_functions.toPush =  function(item){
 		$scope.itemsToPush.push(item.id);
 		$scope.$apply();
 		window.localStorage.setItem("itemsToPush", JSON.stringify($scope.itemsToPush));
 	};
 	$scope.global_functions.countItems = function(){
 		if($scope.itemsToPush)
			return $scope.itemsToPush.length;
		else	
			return 0;
	};
 	Offline.on('up', function(){
		if($scope.global_functions.countItems()>0){
			$scope.global_functions.toReplicate();
		}
	},'');
 		
}]);