app.controller('PostingController', ['$scope', '$routeParams' , function($scope, $routeParams) {
	
	ImgCache.init(function(){
	  console.log('cache created successfully!');
	}, function(){
	  console.log('check the log for errors');
	});
	/*
	 *  INIT VARS
	 */
	$scope.global_functions={};
	$scope.posting={}; $scope.posting_functions={}; $scope.postings={};
	$scope.comment={}; $scope.comment_functions={}; $scope.comments = {}; 
	$scope.like={}; $scope.like_functions={}; $scope.likes = {}; 
	$scope.types = {}; 
	
	$scope.apply 	= function() {if(!$scope.$$phase) {$scope.$apply();}};

	$scope.db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {
					  	//console.log(change);
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
		}else{
			if(!$scope.types[change.id]){	
				$scope.types[change.id]=({type:'POST'});
				$scope.likes[change.id]=new Array();
				//if(change.doc._attachments)
				//	$scope.image_functions.getImage(change.id);
				$scope.db.getAttachment(change.id, 'image', function(err, res) {
					console.log(err || res);
				});

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
				results._id=results.id;delete results.id;
				results._rev=results.rev;delete results.rev;
				$scope.db.remove(results, function(err, results) {
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
		$scope.db.query({map: $scope.posting_functions.isPost}, {reduce: false}, function(err, response) {
			$scope.postings = []; 
			$scope.likes = {}; 
			$scope.comments = {}; 
			$scope.types = {}; 
			angular.forEach(response.rows, function(row, key){
				if(row.value){row.doc=row.value;delete row.value;}
				
				switch (row.doc.type) {
						    case "POST":
						    	$scope.types[row.id]={type:'POST'};
						    	//if(row.doc._attachments)
						    	//	$scope.image_functions.getImage(row.id);
						    	$scope.postings.push(row);
						     //deleteFromDB(row.id);
						     	if(!$scope.likes[row.id]){$scope.likes[row.id]=new Array();}
						    	if(!$scope.comments[row.id]){$scope.comments[row.id]=new Array();}
						        break;
						    case "LIKE":
						        $scope.types[row.id]={type:'LIKE', posting: row.doc.posting};
						        //deleteFromDB(row.id);
						    	if(!$scope.likes[row.doc.posting]){$scope.likes[row.doc.posting]=new Array();}
									$scope.likes[row.doc.posting].push(row);
						        break;
						    case "COMMENT":
						    	//deleteFromDB(row.id);
						        $scope.types[row.id]={type:'COMMENT', posting: row.doc.posting};
						    	if(!$scope.comments[row.doc.posting]){$scope.comments[row.doc.posting]=new Array();}
									$scope.comments[row.doc.posting].push(row);
						        break;
				};	
			});
			$scope.apply();
		});
    };
     function init(){
	 	stickyActionBar();
	 }
	 init();
    
     function deleteFromDB(id){
     	$scope.db.remove(id, function(err, results){});
     }

    
    
    $scope.image_functions={};
	
	/*
	$scope.image_functions.getImage = function(id) {
		ImgCache.isCached(img, function(path, success) {
			if (!success) {
				console.log(img + ' does not exist');
				ImgCache.cacheFile(img);
			} else {
				console.log(img + ' is already existing');
			}
		});

	};
	*/
     
     
     
     
     

	 /*
	  *  LIKE-Functions
	  */ 
	 $scope.like_functions.create = function(posting){
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
			$scope.db.post(doc, function (err, response) {});
		}
	 };
	 $scope.like_functions.createToScope = function(change){
	 		$scope.types[change.id]={type:'LIKE', posting:change.doc.posting};
	 		if(!$scope.likes[change.doc.posting])
	 			$scope.likes[change.doc.posting]=new Array();	 		
	 		$scope.likes[change.doc.posting].push(change);
	 		$scope.apply();
	 };
	 $scope.like_functions.delete = function(like){
	  	$scope.db.get(like.id, function(err, results) {
			$scope.db.remove(results, function(err, results){});
			$scope.like_functions.deleteFromScope(results._id);
		});
	 };
	 $scope.like_functions.deleteFromScope = function(id){
	 		angular.forEach($scope.likes[$scope.types[id].posting], function(value, key){
				if(value.id==id){
					$scope.likes[$scope.types[id].posting].splice(key, 1);
					$scope.apply();
				}
			});
	 };
	 
	 $scope.like_functions.onChange = function(change){	 
	 	if(change.deleted){
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
		$scope.db.post(doc, function (err, response) {});
		document.getElementById('comment_'+posting.id).value='';
	 };
	 $scope.comment_functions.delete = function(comment){
	 	$scope.comment_functions.deleteFromScope(comment.id);
	  	$scope.db.get(comment.id, function(err, results) {
			$scope.db.remove(results, function(err, results){});
			
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
	
}]);
