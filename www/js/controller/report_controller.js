app.controller('ReportController', ['$scope', '$routeParams' ,'$rootScope', function($scope, $routeParams, $rootScope) {
	
	var rand=Math.floor(Math.random()*1000);
	var myControllername='PostingController'+rand;
	$rootScope.activeController='PostingController'+rand;	
	var db_changes=new Object();
	
	/*
	 *  INIT VARS
	 */
	$rootScope.postingPossible=false;
	
	$scope.global_functions = ($scope.global_functions)? $scope.global_functions:{};
	$scope.posting={}; $scope.posting_functions={}; $scope.postings=new Array();
	$scope.comment={}; $scope.comment_functions={}; $scope.comments = {}; 
	$scope.like={}; $scope.like_functions={}; $scope.likes = {}; 
	$scope.types = {}; 
	
	$scope.apply 	= function() {if(!$scope.$$phase) {$scope.$apply();}};
	
	$scope.db.info(function(err, info) {
			db_changes[rand]=$scope.db.changes({
					  continuous: true,
					  include_docs: true,
					  since:info.update_seq,
					  onChange:  function(change) {
					  	
					  	if(myControllername!=$rootScope.activeController){
					  		db_changes[rand].cancel();
					  		return;
					  	}
					  	console.log('onChange ' + rand);
					  	console.log(change);
					  	/*
					  	 *  SET DOC.TYPE IF NOT AVAILABLE
					  	 */
					  	if($scope.types[change.id]){
						  	if($scope.types[change.id].type && !change.doc.type){
						  		change.doc.type=$scope.types[change.id].type;
						  	}
					  	}
					  	switch (change.doc.type) {
						    case "REPORT":
						        $scope.posting_functions.onChange(change);
						        break;
						};					  	 
					  },
					  complete: function(err, response) {
					  	console.log(err || response);
					  }
	});
	});


	/*
	 *  POSTING
	 */
	$scope.posting_functions.onChange = function(change){
		
		if(change.deleted){
			angular.forEach($scope.reports, function(value, key){
				if(value.id==change.id){
					$scope.reports.splice(key, 1);
				}
			});
		}else if(!$scope.types[change.id]){
			if (change.doc.image && !change.doc._attachments) {
			
			}else if(change.doc.image && change.doc._attachments) {
				$scope.types[change.id]=({type:'REPORT',posting:change.doc.posting});
				$scope.likes[change.id]=new Array();
				if(change.doc.user.id==$scope.user.getId() && $scope.images[change.id]){
					change.temp_img=$scope.images[change.id];
				}
				
				$scope.db.get(change.doc.posting, function(err, results) {
							    		results.id=results._id;
							    		results.doc=results;
							    		results.reportby=change.doc.user;
							    		if(!$scope.types[results.id]){$scope.types[results.id]=new Array();}
							        		$scope.types[results.id]={type:'REPORT', posting: results.doc.posting};
										//$scope.reports[row.doc.posting]=results;
										$scope.reports.push(results);
										$scope.apply();
				});
	
			}else {	
				$scope.types[change.id]=({type:'REPORT', posting:change.doc.posting});
				$scope.likes[change.id]=new Array();
				$scope.db.get(change.doc.posting, function(err, results) {
							    		results.id=results._id;
							    		results.doc=results;
							    		results.reportby=change.doc.user;
							    		if(!$scope.types[results.id]){$scope.types[results.id]=new Array();}
							        		$scope.types[results.id]={type:'REPORT', posting: results.doc.posting};
										//$scope.reports[row.doc.posting]=results;
										$scope.reports.push(results);
										$scope.apply();
				});
			}
		}
		$scope.apply();		
	};
	
	$scope.posting_functions.delete = function(posting) {
		
		var confirmDelete = window.confirm('Do you really want to delete this post?');

		if(confirmDelete) {
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
		}
	};
	$scope.posting_functions.isPost = function(doc) { 
		if(doc.type=='REPORT') {   emit([doc._id, 0], doc);}
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
		if($scope.reports.length>=1){
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
	 
	$scope.reports = []; 
	$scope.global_functions.showWall = function() {
		$scope.db.query({map: $scope.posting_functions.isPost}, {reduce: true}, function(err, response) {
			$scope.reports =[]; 
			//$scope.postings = []; 
			$scope.likes = {}; 
			//$scope.comments = {}; 
			//$scope.types = {}; 
			//$scope.response=response;
			
			angular.forEach(response.rows, function(row, key){
				if(row.value){row.doc=row.value;delete row.value;}
				if(row.doc.created){
					switch (row.doc.type) {
							    case "REPORT":
							    	//$scope.types[row.id]={type:'POST'};						    	
							    	
							    	$scope.db.get(row.doc.posting, function(err, results) {
							    		results.id=results._id;
							    		results.doc=results;
							    		results.reportby=row.doc.user;
							    		if(!$scope.types[results.id]){$scope.types[results.id]=new Array();}
							        		$scope.types[results.id]={type:'REPORT', posting: results.doc.posting};
										//$scope.reports[row.doc.posting]=results;
										$scope.reports.push(results);
										$scope.apply();
									});
							    	
							    	
							    	//
							    	
							    	
							     	//if(!$scope.likes[row.id]){$scope.likes[row.id]=new Array();}
							    	//if(!$scope.comments[row.id]){$scope.comments[row.id]=new Array();}
							        break;
					};	
				}
				$scope.apply();
			});
			console.log($scope.reports);
			$scope.apply();
			//$scope.apply();
		});
    };
    
     function deleteFromDB(id){
     	$scope.db.remove(id, function(err, results){$scope.global_functions.toPush(results);});
     }

    
    
    $scope.image_functions={};
   
     

	
	$scope.apply();	
	
	
	$scope.posting_functions.delete = function(posting) {
		
		
		var confirmDelete = window.confirm('Do you really want to delete this post?');

		if(confirmDelete) {
			console.log(posting._id);
			$scope.db.get(posting.id, function(err, results) {
				results.msg='';
				console.log(results);
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
		}
	};
}]);
