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
					  	switch (change.doc.type) {
						    case "POST":
						        $scope.posting_functions.onChangePosting(change);
						        break;
						    case "LIKE":
						        $scope.like_functions.onChangeLike(change);
						        break;
						};					  	 
					  },
					  complete: function(err, response) {
					  	
					  }
	});

	$scope.posting_functions.onChangePosting = function(change){
		console.log('$scope.posting_functions.onChangePosting');
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
	};
	
	$scope.posting_functions.delete = function(posting) {
		console.log('$scope.posting_functions.delete');
		$scope.db.get(posting.id, function(err, results) {
			$scope.db.remove(results, function(err, results){});
		});
		
		
	};
	

	$scope.posting_functions.isPost = function(doc) { if(doc.type=='POST') {   emit(doc.created, doc);  }};
	$scope.posting_functions.showPostings = function() {
		console.log('$scope.posting_functions.showPostings');
		$scope.db.query({map: $scope.posting_functions.isPost}, {reduce: false}, function(err, response) {
			$scope.postings=response.rows;
			angular.forEach($scope.postings, function(value, key){
				$scope.postings[key].doc=value.value;
				delete  $scope.postings[key].value;
			});
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
	 	if((posting.created/1000) < maxTimeDifference){
	 		return true;
	 	}
	 	return false;
	 };
	 
	 
	 
	 
	 
	 $scope.like={};
	 $scope.likes={};
	 $scope.like_functions={};
	 $scope.like_functions.like = function(posting){
	 	doc={ 
			created : new Date().getTime(),
			posting: posting.id,
			user: {
				id : $scope.user.getId(),
				name : $scope.user.getName()
			},
			type : 'LIKE'
		};
		$scope.db.post(doc, function (err, response) {});
	 };
	 
	 $scope.like_functions.onChangeLike = function(change){
	 	console.log('$scope.like_functions.onChangeLike');
	 	
	 };

}]);
