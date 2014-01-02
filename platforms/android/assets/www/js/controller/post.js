function PostingController($scope){
		
	$scope.apply 	= function() {if(!$scope.$$phase) {$scope.$apply();}};
	
	
	
	var db = new PouchDB('ppnet');
	//var remoteCouch = 'https://ppnet:pixelpark@ppnet.cloudant.com/ppnet';
	//var remoteCouch = 'http://10.50.1.46:5984/ppnet';
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
					  	console.log(change);
					  	 if (!change.deleted) {
						  	console.log('!change.deleted' + "$scope.getPosting");
						  	$scope.getPosting(change.id);
						 }else{
						 	console.log('change.deleted');
						 	showPostings();
						 }
					  }
				  	});

	}
	if (remoteCouch){sync();}
	
	
	function onChange(){
		console.log('onChange');
		showPostings();
	}
	
	function onComplete(){
		console.log('onComplete');
		showPostings();
	}
	
	function showPostings(){
		db.allDocs({include_docs: true, descending: true}, function(err, docs) {
			$scope.showPostings(docs);
	    });	
	}
	
	function createPosting(event) {
		
		if (event.keyCode === ENTER_KEY) {
			console.log('createPosting');
			doc={ 
				created : new Date().getTime(),
				title: newTodoDom.value,
				type : 'POST'
			 };
			posting={doc:doc};		
			db.post(doc, function (err, response) {
				console.log(err || response);
			});
			newTodoDom.value = '';
	    }
	}

	function addPosting(doc) {
		console.log('addPosting');
		$scope.postings.push(doc);
		$scope.apply();
	};

	$scope.getPosting = function(id) {
		console.log('getPosting - '+ id);
		db.get(id, function(err, doc) {
			console.log(doc);
			if(doc){
				doc.doc=doc;
				addPosting(doc);
			}
		});
	};
	
	$scope.deletePosting = function(doc) {
		console.log(doc.id);
		db.get(doc.id, function(err, results) {
			console.log(err || results);
			db.remove(results, function(err, results){
				console.log(err || results);
			});
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
	
	var ENTER_KEY = 13;
  	var newTodoDom = document.getElementById('new-posting');
	function addEventListeners() {
    	newTodoDom.addEventListener('keypress', createPosting, false);
  	}

  	addEventListeners();
}