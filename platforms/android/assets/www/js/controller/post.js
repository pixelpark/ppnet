function PostController($scope){
		
	$scope.apply 	= function() {if(!$scope.$$phase) {$scope.$apply();}};
	
	
	
	var db = new PouchDB('ppnet');
	//var remoteCouch = 'https://ppnet:pixelpark@ppnet.cloudant.com/ppnet';
	//var remoteCouch = 'http://10.50.1.46:5984/ppnet';
	var remoteCouch = 'http://54.224.162.246:5984/ppnet';
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
						  	console.log('!change.deleted' + "$scope.getPost");
						  	$scope.getPost(change.id);
						 }else{
						 	console.log('change.deleted');
						 	
						 }
					  }
				  	});

	}
	if (remoteCouch){sync();}
	
	
	function onChange(){
		console.log('onChange');
		showPosts();
	}
	
	function onComplete(){
		console.log('onComplete');
		showPosts();
	}
	
	function showPosts(){
		db.allDocs({include_docs: true, descending: true}, function(err, docs) {
			$scope.showPosts(docs);
	    });	
	}
	
	function createPost(event) {
		
		if (event.keyCode === ENTER_KEY) {
			console.log('createPost');
			doc={ 
				created : new Date().getTime(),
				title: newTodoDom.value,
				type : 'POST'
			 };
			post={doc:doc};		
			db.post(doc, function (err, response) {
				console.log(err || response);
			});
			newTodoDom.value = '';
	    }
		/*
		
		*/
	}

	function addPost(doc) {
		console.log('addPost');
		$scope.posts.push(doc);
		$scope.apply();
	};

	$scope.getPost = function(id) {
		console.log('getPost - '+ id);
		db.get(id, function(err, doc) {
			console.log(doc);
			if(doc){
				doc.doc=doc;
				addPost(doc);
			}
			doc.doc=doc;
			addPost(doc);
		});
	};
	
	$scope.deletePost = function(doc) {
		console.log(doc.id);
		//console.log(db);
		db.get(doc.id, function(err, results) {
			console.log(err || results);
			db.remove(results, function(err, results){
				console.log(err || results);
			});
		});
		
		
	};
	
	$scope.posts=[];
	$scope.showPosts = function(docs) {
		$scope.posts=docs.rows;		
		$scope.apply();
    };
    showPosts();
    
	
    $scope.orderByFunction = function(post) {
    	if(post.created)
    		return post.created;
    	else
    		return post.doc.created;
	};
	
	var ENTER_KEY = 13;
  	var newTodoDom = document.getElementById('new-todo');
	function addEventListeners() {
    	newTodoDom.addEventListener('keypress', createPost, false);
  	}

  	addEventListeners();
}