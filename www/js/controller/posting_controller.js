app.controller('PostingController', ['$scope', '$routeParams' , function($scope, $routeParams) {
	
	
	/*
	 *  INIT VARS
	 */
	$scope.posting={};
	$scope.posting_functions={};
	$scope.postings={};
	
	$scope.posting.hashtag=($routeParams.hashtag)?'#'+$routeParams.hashtag.toUpperCase():'#';
	
	
	$scope.apply 	= function() {if(!$scope.$$phase) {$scope.$apply();}};

	
	$scope.db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {
					  	 onChange(change);
					  },
					  complete: function(err, response) {
					  	 onComplete();
					  }
	});

	function onChange(change){
		if(change.deleted){
			angular.forEach($scope.postings, function(value, key){
				if(value.id==change.id){
					$scope.postings.splice(key, 1);
				}
			});
		}else{
			$scope.postings.push(change);
		}
		$scope.apply();		
	}
	
	function onComplete(){
		$scope.posting_functions.showPostings();
	}
	
	$scope.posting_functions.delete = function(posting) {
		$scope.db.get(posting.id, function(err, results) {
			$scope.db.remove(results, function(err, results){});
		});
		
		
	};
	
	$scope.posting_functions.showPostings = function() {
		$scope.db.allDocs({include_docs: true, descending: true}, function(err, docs) {
			$scope.postings=docs.rows;
			$scope.apply();
	    });	
    };
    
    $scope.posting_functions.orderByCreated = function(posting) {
    	if(posting.created)
    		return posting.created;
    	else
    		return posting.doc.created;
	};

	 $scope.posting_functions.isDeletable = function(posting) {
	 	if(posting.doc.user.id == $scope.user.getId())
	 		return true;
	 	return false;
	 };
	 
	 $scope.time = function(timestamp) {timestamp=timestamp/1000;return timestamp;};
	 $scope.posting_functions.showTimestamp = function(posting) {
	 	// Generate timestamp for 24hours time difference
	 	maxTimeDifference = Math.round((new Date()).getTime() / 1000) - 86400;
	 	if((posting.doc.created/1000) < maxTimeDifference){
	 		return true;
	 	}
	 	return false;
	 };
	 
	 
	 $scope.like={};
	 $scope.likes={};
	 $scope.like_functions={};
	 $scope.like_functions.create = function(){
	 	
	 };

	 function init(){
	 	stickyActionBar();
	 }

	 init();

}]);
