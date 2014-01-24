app.controller('PostingController', ['$scope', '$routeParams' , function($scope, $routeParams) {
	
	
	/*
	 *  INIT VARS
	 */
	$scope.posting={};
	$scope.posting_functions={};
	$scope.postings={};
	
	$scope.wall_functions={};
	
	
	$scope.like={};
	$scope.like_functions={};
	$scope.likes = {}; 
	
	$scope.types = {}; 
	
	
	
	$scope.posting.hashtag=($routeParams.hashtag)?'#'+$routeParams.hashtag.toUpperCase():'#';
	
	
	$scope.apply 	= function() {if(!$scope.$$phase) {$scope.$apply();}};

	
	$scope.db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {
					  	
					  	/*
					  	 *  SET DOC.TYPE IF NOT AVAILABLE
					  	 */
					  	if($scope.types[change.id]){
						  	if($scope.types[change.id].type && !change.doc.type){
						  		change.doc.type=$scope.types[change.id].type;
						  	}
					  	}
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
		if(change.deleted){
			angular.forEach($scope.postings, function(value, key){
				if(value.id==change.id){
					$scope.postings.splice(key, 1);
				}
			});
		}else{
			$scope.types[change.id]=({type:'POST'});
			$scope.likes[change.id]=new Array();
			$scope.postings.push(change);
		}
		$scope.apply();		
	};
	
	$scope.posting_functions.delete = function(posting) {
		$scope.db.get(posting.id, function(err, results) {
			$scope.db.remove(results, function(err, results){});
		});
	};
	$scope.posting_functions.isPost = function(doc) { 
		if(doc.type=='POST') {   emit([doc._id, 0], doc);}
		if(doc.type=='LIKE') {   emit([doc.posting, 1], doc);} 
		if(doc.type=='COMMENT') {   emit([doc.posting, 2], doc);}   
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
	 
	 /*
	  *  RENAME?
	  */
	 
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
	
	
	
	
	
	
	
	
	
	
	
	
	/*
	 * 
	 *  GLOBAL
	 * 
	 */
	
	$scope.wall_functions.showWall = function() {
		$scope.db.query({map: $scope.posting_functions.isPost}, {reduce: false}, function(err, response) {
			$scope.postings = []; 
			$scope.likes = {}; 
			$scope.types = {}; 

			var actual_like_id=false;
			
			angular.forEach(response.rows, function(row, key){
				if(row.value){row.doc=row.value;delete row.value;}
				
				switch (row.doc.type) {
						    case "POST":
						    	$scope.types[row.id]={type:'POST'};
						    	actual_id=row.id;
						    	$scope.postings.push(row);
						    	if(!$scope.likes[row.id]){$scope.likes[row.id]=new Array();}
						        break;
						    case "LIKE":
						        $scope.types[row.id]={type:'LIKE', posting: row.doc.posting};
						        //$scope.db.remove(row.doc, function(err, results){
						        //	console.log(err || results);
						        //});
						    	if(!$scope.likes[row.doc.posting]){$scope.likes[row.doc.posting]=new Array();}
									$scope.likes[row.doc.posting].push(row);
						        break;
						    case "COMMENT":
						        $scope.types[row.id]='COMMENT';
						        // $scope.db.remove(row.doc, function(err, results){
						        //	console.log(err || results);
						        //});
						    	if(!$scope.comment[row.doc.posting]){$scope.comment[row.doc.posting]=new Array();}
									$scope.comment[row.doc.posting].push(row);
						        break;
				};	
			});
			//console.log($scope.types);
			$scope.apply();
		});
    };
     function init(){
	 	stickyActionBar();
	 }
	 init();
    
	 
	 
	 
	 /*
	  *  LIKE-Functions
	  */
	 	 
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
	 
	  $scope.like_functions.unlike = function(like){
	  	$scope.db.get(like.id, function(err, results) {
			$scope.db.remove(results, function(err, results){});
		});
	  };
	 
	 $scope.like_functions.onChangeLike = function(change){	 
	 		
	 	if(change.deleted){
			angular.forEach($scope.likes[$scope.types[change.id].posting], function(value, key){
				if(value.id==change.id){
					$scope.likes[$scope.types[change.id].posting].splice(key, 1);
					$scope.apply();
				}
			});
	 	}else{
	 		$scope.types[change.id]={type:'LIKE', posting:change.doc.posting};
	 		if(!$scope.likes[change.doc.posting])
	 			$scope.likes[change.doc.posting]=new Array();
	 		$scope.likes[change.doc.posting].push(change);
	 		$scope.apply();
	 	}
	 };
	 
}]);
