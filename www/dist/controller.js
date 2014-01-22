app.controller('LoginController', ['$scope', function($scope) {
	$scope.db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {
					  	 console.log('LoginController');
					  }
	});
 	$scope.user = {};
 	$scope.user_functions = {};
 	
	$scope.user_functions.login = function(){
		//$user.login($scope.user);
	};
	
	
}]);
function PostingActionController($scope){
	// Defines which action is currently active
	$scope.current_action = false;
	
	// Toggles the AppActions
	$scope.toggleAction = function(target){
		if($scope.current_action == target) {
			$scope.current_action = false;
		}
		else {
			$scope.current_action = target;	
		}
	};
	
	// Prints out the 'active' class for the corresponding <li>-Tag
	$scope.activeClass = function(target){
		return target == $scope.current_action ? 'active' : undefined;
	};
}

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
			console.log('DELETE');
			angular.forEach($scope.postings, function(value, key){
				if(value.id==change.id){
					$scope.postings.splice(key, 1);
				}
			});
		}else 
		if(change.changes){
			console.log('CHANGED');
		}else{
			console.log('CREATE');
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
	 	// Set the maximum time difference for showing the date
	 	maxTimeDifferenceForToday = Math.round((new Date()).getTime() / 1000) - ageOfDayInSeconds();
	 	maxTimeDifferenceForYesterday = maxTimeDifferenceForToday - 86400;
	 	postTime = posting.doc.created/1000;
	 	if((postTime > maxTimeDifferenceForYesterday) && (postTime < maxTimeDifferenceForToday)){
	 		return 'yesterday';
	 	}
	 	else if(postTime < maxTimeDifferenceForToday){
	 		return 'older';
	 	}
	 	return 'today';
	 };

	 function ageOfDayInSeconds(){
	 	// Calculate beginning of the current day in seconds
	 	current_date = new Date();
	 	current_day_hours = current_date.getHours();
	 	current_day_minutes = current_date.getMinutes();
	 	return (current_day_hours*60*60) + (current_day_minutes*60);
	 };
	 
	 
	 
	 
	 
	 $scope.like={};
	 $scope.likes={};
	 $scope.like_functions={};
	 $scope.like_functions.like = function(posting){
	 	/*
	 	doc={ 
			created : new Date().getTime(),
			posting: posting.id,
			user: {
				id : $scope.user.getId(),
				name : $scope.user.getName()
			},
			type : 'LIKE'
		};
		*/

		if(!posting.doc.likes){
			posting.doc.likes={};	
		}
		posting.doc.likes[$scope.user.getId()]=true;
		$scope.db.put(posting.doc, function (err, response) {
			console.log(err || response);
			if(err){
				$scope.db.get(posting.id, function(err, doc) {
					posting.doc=doc;
					$scope.like_functions.like(posting);
				});
			}
		});
	 };
	 
	 $scope.like_functions.onChangeLike = function(change){
	 	console.log('$scope.like_functions.onChangeLike');
	 	
	 };

	 function init(){
	 	stickyActionBar();
	 }

	 init();

}]);

app.controller('PostingTextController', ['$scope', function($scope) {
	$scope.posting_functions={};
	
	$scope.posting_functions.create = function(){		
		var posting = document.getElementById('new-posting').value;
		if(!posting.length>=1)
			return false;
		value={ 
			created : new Date().getTime(),
			msg: posting,
			user: {
				id : $scope.user.getId(),
				name : $scope.user.getName()
			},
			type : 'POST'
		};	
		$scope.db.post(value, function (err, response) {});
		document.getElementById('new-posting').value = '';
	};


}]);
