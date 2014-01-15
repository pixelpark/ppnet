function PostingController($scope){

	$scope.apply 	= function() {if(!$scope.$$phase) {$scope.$apply();}};
	
	$scope.time = function(timestamp) {
		/*
		 *  FACEBOOK-LIKE Zeitausgabe
		 */
		timestamp=timestamp/1000;
		return timestamp;
	};
	
	var db = new PouchDB('ppnet');
	var remoteCouch = 'http://couchdb.simple-url.com:5984/ppnet';
	function sync() {
		  var opts = {continuous: true};
		  db.replicate.from(remoteCouch, opts);
		  db.replicate.to(remoteCouch, opts);
		  db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {
					  	 if (!change.deleted) {
						  	$scope.getPosting(change.id);
						 }else{
						 	showPostings();
						 }
					  }
				  	});

	};
	
	if (remoteCouch){sync();}
	
	
	function onChange(){
		showPostings();
	}
	
	function onComplete(){
		showPostings();
	}
	
	function showPostings(){
		db.allDocs({include_docs: true, descending: true}, function(err, docs) {
			$scope.showPostings(docs);
	    });	
	}
	
	$scope.posting={};
	$scope.posting.create = function(){		
			doc={ 
				created : new Date().getTime(),
				msg: document.getElementById('new-posting').value,
				user: $scope.user.vars,
				//coords : $scope.position.coords,
				type : 'POST'
			 };	
			db.post(doc, function (err, response) {});
			document.getElementById('new-posting').value = '';
	};

	function addPosting(doc) {
		$scope.postings.push(doc);
		$scope.apply();
	};

	$scope.getPosting = function(id) {
		db.get(id, function(err, doc) {
			if(doc){
				doc.doc=doc;
				addPosting(doc);
			}
		});
	};
	
	$scope.deletePosting = function(doc) {
		db.get(doc.id, function(err, results) {
			db.remove(results, function(err, results){});
		});
		
		
	};
	
	$scope.postings=[];
	$scope.showPostings = function(docs) {
		$scope.postings=docs.rows;		
		$scope.apply();
    };
    showPostings();
    
	
    $scope.orderByFunction = function(posting) {
    	if(posting.created)
    		return posting.created;
    	else
    		return posting.doc.created;
	};
	
	
	 
	 $scope.isDeletable = function(posting) {
	 	if(posting.doc.user.id == $scope.user.vars.id)
	 		return true;
	 	return false;
	 };
	 

}