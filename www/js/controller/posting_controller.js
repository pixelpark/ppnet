app.controller('PostingController', ['$scope', '$routeParams' ,'$rootScope', function($scope, $routeParams, $rootScope) {
	
	var rand=Math.floor(Math.random()*1000);
	var myControllername='PostingController'+rand;
	$rootScope.activeController='PostingController'+rand;	
	var db_changes=new Object();
	
	/*
	 *  INIT VARS
	 */
	$rootScope.postingPossible=true;
	
	$scope.global_functions = ($scope.global_functions)? $scope.global_functions:{};
	$scope.posting={}; $scope.posting_functions={}; $scope.postings=new Array();
	$scope.comment={}; $scope.comment_functions={}; $scope.comments = {}; 
	$scope.like={}; $scope.like_functions={}; $scope.likes = {}; 
	$scope.types = {}; 
	
	$scope.apply 	= function() {if(!$scope.$$phase) {$scope.$apply();}};
	
	
	db_changes[rand]=$scope.db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {
					  	
					  	if(myControllername!=$rootScope.activeController){
					  		db_changes[rand].cancel();
					  		return;
					  	}
					  	console.log('onChange ' + rand);
					  	
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
						        $scope.posting_functions.onChange(change);
						        break;
						    case "LIKE":
						        $scope.like_functions.onChange(change);
						        break;
						    case "COMMENT":
						        $scope.comment_functions.onChange(change);
						        break;
						};					  	 
					  },
					  complete: function(err, response) {
					  	
					  }
	});
	/*
	 *  POSTING
	 */
	$scope.posting.hashtag=($routeParams.hashtag)?'#'+$routeParams.hashtag.toUpperCase():'#';
	$scope.posting_functions.onChange = function(change){
		
		if(change.deleted){
			angular.forEach($scope.postings, function(value, key){
				if(value.id==change.id){
					$scope.postings.splice(key, 1);
				}
			});
		}else if(!$scope.types[change.id]){
			if (change.doc.image && !change.doc._attachments) {
			
			}else if(change.doc.image && change.doc._attachments) {
				$scope.types[change.id]=({type:'POST'});
				$scope.likes[change.id]=new Array();
				if(change.doc.user.id==$scope.user.getId() && $scope.images[change.id]){
					change.temp_img=$scope.images[change.id];
				}
				$scope.postings.push(change);
			}else {	
				$scope.types[change.id]=({type:'POST'});
				$scope.likes[change.id]=new Array();
				$scope.postings.push(change);
			}
		}
		$scope.apply();		
	};
	
	$scope.posting_functions.delete = function(posting) {
		
		$scope.db.get(posting.id, function(err, results) {
			results.msg='';
			delete results.msg_formatted;
			$scope.db.put(results, function(err, results) {
				delete results.ok;
				var posting_id=results.id;
				results._id=results.id;delete results.id;
				results._rev=results.rev;delete results.rev;
				$scope.db.remove(results, function(err, results) {
					pusher=new Array();
					pusher.push(results.id);
					angular.forEach($scope.likes[posting_id], function(value, key){
						$scope.like_functions.delete(value,0);
						pusher.push(value.id);
					});
					angular.forEach($scope.comments[posting_id], function(value, key){
						$scope.comment_functions.delete(value,0);
						pusher.push(results.id);
					});
					$scope.global_functions.toPush(pusher);
				});
				
				
				
			});
		});
	};
	$scope.posting_functions.isPost = function(doc) { 
		if(doc.type=='POST') {   emit([doc._id, 0], doc);}
		if(doc.type=='LIKE') {   emit([doc.posting, 1], doc);} 
		if(doc.type=='COMMENT') {   emit([doc.posting, 2], doc);}   
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
	 $scope.global_functions.showLoader = function(item) {
		if($scope.postings.length>=1){
			return false;
		}
		return true;
	 };
	
	 $scope.global_functions.orderByCreated = function(item) {
    	if(item.created)
    		return item.created;
    	else
    		return item.doc.created;
	};
	
	 $scope.global_functions.isDeletable = function(item) {
	 	if(item.doc.user.id == $scope.user.getId())
	 		return true;
	 	return false;
	 };
	 
	$scope.global_functions.showWall = function() {
		$scope.db.query({map: $scope.posting_functions.isPost}, {reduce: true}, function(err, response) {
			$scope.postings = []; 
			$scope.likes = {}; 
			$scope.comments = {}; 
			$scope.types = {}; 
			$scope.response=response;
			
			angular.forEach(response.rows, function(row, key){
				if(row.value){row.doc=row.value;delete row.value;}
				if(row.doc.created){
					switch (row.doc.type) {
							    case "POST":
							    	$scope.types[row.id]={type:'POST'};
							    	$scope.postings.push(row);
							     	if(!$scope.likes[row.id]){$scope.likes[row.id]=new Array();}
							    	if(!$scope.comments[row.id]){$scope.comments[row.id]=new Array();}
							        break;
							    case "LIKE":
							        if(!$scope.types[row.id]){$scope.types[row.id]=new Array();}
							        $scope.types[row.id]={type:'LIKE', posting: row.doc.posting};
							    	if(!$scope.likes[row.doc.posting]) {break;};
									$scope.likes[row.doc.posting].push(row);
							        break;
							    case "COMMENT":
							    	if(!$scope.types[row.id]){$scope.types[row.id]=new Array();}
							        	$scope.types[row.id]={type:'COMMENT', posting: row.doc.posting};
							    	if(!$scope.comments[row.doc.posting]){break;};
									$scope.comments[row.doc.posting].push(row);
							        break;
					};	
				}
				$scope.apply();
			});
			//$scope.apply();
		});
    };
     function init(){
	 	stickyActionBar();
	 }
	 init();
    
     function deleteFromDB(id){
     	$scope.db.remove(id, function(err, results){$scope.global_functions.toPush(results);});
     }

    
    
    $scope.image_functions={};
   
     

	 /*
	  *  LIKE-Functions
	  */ 
	 $scope.like_functions.create = function(posting){
	 	console.log('$scope.like_functions.create' + rand);
	 	var likeIsExisting=0;
	 	if($scope.likes[posting.id]){
		 	angular.forEach($scope.likes[posting.id], function(row, key){
		 		if(row.doc.user.id==$scope.user.getId()){
		 			likeIsExisting=1;
		 		}
		 	});
	 	}
	 	if(!likeIsExisting){
		 	doc={ 
				created : new Date().getTime(),
				posting: posting.id,
				user: {
					id : $scope.user.getId(),
					name : $scope.user.getName()
				},
				type : 'LIKE'
			};
			var change={};
				change.doc=doc;
			$scope.like_functions.createToScope(change);
			$scope.db.post(doc, function (err, response) {$scope.global_functions.toPush(response);});
		}
	 };
	 $scope.like_functions.createToScope = function(change){
	 	console.log('$scope.like_functions.createToScope' + rand);
	 		$scope.types[change.id]={type:'LIKE', posting:change.doc.posting};
	 		if(!$scope.likes[change.doc.posting])
	 			$scope.likes[change.doc.posting]=new Array();	 		
	 		$scope.likes[change.doc.posting].push(change);
	 		$scope.apply();
	 };
	 $scope.like_functions.delete = function(like,topush){
	 	console.log('$scope.like_functions.delete' + rand);
	 	topush = typeof topush !== 'undefined' ? topush : 1;
	  	$scope.db.get(like.id, function(err, results) {
			$scope.db.remove(results, function(err, results){
				if(topush)$scope.global_functions.toPush(results);
			});
			if(topush)$scope.like_functions.deleteFromScope(results._id);
		});
	 };
	 $scope.like_functions.deleteFromScope = function(id){
	 	console.log('$scope.like_functions.deleteFromScope' + rand);
	 			if($scope.types[id]){
			 		angular.forEach($scope.likes[$scope.types[id].posting], function(value, key){
						if(value.id==id){
							$scope.likes[$scope.types[id].posting].splice(key, 1);
							$scope.apply();
						}
					});
				}
  	 };
	 
	 $scope.like_functions.onChange = function(change){	 
	 	console.log('$scope.like_functions.onChange' + rand);
	 	if(change.deleted){
	 		if($scope.likes[$scope.types[change.id].posting])
				$scope.like_functions.deleteFromScope(change.id);
	 	}else{
	 		if($scope.likes[change.doc.posting]){
			 	angular.forEach($scope.likes[change.doc.posting], function(row, key){
			 		if(change.doc.user.id==$scope.user.getId()){
			 			$scope.like_functions.deleteFromScope(row._id);
			 		}
			 	});
		 	}
		 	$scope.like_functions.createToScope(change);	 		
	 	}
	 };
	 
	 
	 /*
	  *  COMMENT FUNCTIONS
	  */
	 $scope.comment_functions.showComments = function(item) {
		if(!$scope.comments[item]){
			return false;
		}
		return true;
	 };
	 
	 $scope.comment_functions.create = function(posting){
	 
	 	var comment = document.getElementById('comment_'+posting.id).value;
	 	if(!comment.length>=1)
			return false;
				
	 	doc={ 
			created : new Date().getTime(),
			posting: posting.id,
			msg : comment,
			user: {
				id : $scope.user.getId(),
				name : $scope.user.getName()
			},
			type : 'COMMENT'
		};
		
		$scope.db.post(doc, function (err, response) {$scope.global_functions.toPush(response);});
		document.getElementById('comment_'+posting.id).value='';
	 };
	 $scope.comment_functions.delete = function(comment,topush){
	 	topush = typeof topush !== 'undefined' ? topush : 1;
	 	if(topush)$scope.comment_functions.deleteFromScope(comment.id);
	  	$scope.db.get(comment.id, function(err, results) {
			$scope.db.remove(results, function(err, results){
				if(topush)$scope.global_functions.toPush(results);
			});
			
		});
	 };
	 $scope.comment_functions.deleteFromScope = function(id){
	 		angular.forEach($scope.comments[$scope.types[id].posting], function(value, key){
				if(value.id==id){
					$scope.comments[$scope.types[id].posting].splice(key, 1);
					$scope.apply();
				}
			});
	 };
	 $scope.comment_functions.onChange = function(change){	 
	 	if(change.deleted){
			$scope.comment_functions.deleteFromScope(change.id);
	 	}else{
	 		$scope.types[change.id]={type:'COMMENT', posting:change.doc.posting};
	 		if(!$scope.comments[change.doc.posting])
	 			$scope.comments[change.doc.posting]=new Array();
	 		$scope.comments[change.doc.posting].push(change);
	 		$scope.apply();
	 	}
	 };
	
	$scope.apply();	
}]);
