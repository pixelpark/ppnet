app.controller('PostingController', ['$scope', function($scope) {
	/*
	 *  INIT VARS
	 */
	$scope.posting={};
	$scope.posting_functions={};
	$scope.postings={};
	
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

}]);