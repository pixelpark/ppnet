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
	

	$scope.posting_functions.isPost = function(doc) { 
		if(doc.type=='POST') {   emit([doc._id, 0], doc);}
		if(doc.type=='LIKE') {  console.log('a'); emit([doc.posting, 1], doc); }  
	};
	$scope.wall_functions={};
	$scope.wall_functions.showWall = function() {
		console.log('$scope.posting_functions.showPostings');
		$scope.db.query({map: $scope.posting_functions.isPost}, {reduce: false}, function(err, response) {
			$scope.data=[];	
			
			$scope.postings = []; 
			$scope.likes = {}; 

			var last_id=false;
			var temp_like=new Array();
			
			angular.forEach(response.rows, function(row, key){
				if(row.value){row.doc=row.value;delete row.value;}
				
				switch (row.doc.type) {
						    case "POST":
						    	id=row.id;
						    	$scope.postings.push(row);
						        break;
						    case "LIKE":
						    	
						    	
						    	if(!temp_like[row.doc.posting])
						    		temp_like[row.doc.posting]=new Array();
								temp_like[row.doc.posting].push(row);

								if(last_id)
									if(last_id!=id){
										$scope.likes[last_id]={};
										$scope.likes[last_id]=(temp_like[row.doc.posting]);
									}
										
								last_id=id;
								
						        break;
				};	

				
			});

			console.log(temp_like);
			$scope.data=$scope.likes;
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
	 	console.log(change);
	 	
	 	if(change.deleted){
	 		console.log('DELETE');
	 		
	 	}else{
	 		console.log('CREATED');
	 		
	 		
	 	}
	 };

	 function init(){
	 	stickyActionBar();
	 }

	 init();

}]);
