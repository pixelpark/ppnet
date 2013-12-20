function PostController($scope, $http, $routeParams,$location){
		
	$scope.apply 	= function() {if(!$scope.$$phase) {$scope.$apply();}};
	
	
	var db = new PouchDB('ppnet');
	//var remoteCouch = 'https://ppnet:pixelpark@ppnet.cloudant.com/ppnet';
	var remoteCouch = 'http://10.50.1.46:5984/ppnet';
	//var remoteCouch = 'http://54.227.230.129:5984/ppnet';
	function sync() {
		  var opts = {continuous: true};

		  
		 
		  db.replicate.from(remoteCouch, opts);
		  db.replicate.to(remoteCouch, opts);
		  db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {
						  console.log("$scope.getPost");
						  $scope.getPost(change.id);
					  }
				  });
		  
		  	/*changes({
			    continuous: true,
			    onChange: function(doc) {
			      //console.log(doc);
			      if (!doc.deleted) {
			        //console.log('!doc.deleted');
			        //$scope.addPost(doc);
			      } else {
			    	//console.log('doc.deleted');
			    	//showPosts();
			      }
			    }
			  });
			  */
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
	
	$scope.createPost = function() {
		console.log('createPost');
		doc={ 
				created : new Date().getTime(),
				title: $scope.form.text,
				type : 'POST'
			 };
		post={doc:doc};		
		db.post(doc, function (err, response) {
			console.log(err || response);
		});
	};

	function addPost(doc) {
		console.log('addPost');
		$scope.posts.push(doc);
		$scope.apply();
	};

	$scope.getPost = function(id) {
		console.log('getPost');
		db.get(id, function(err, doc) {
			console.log(doc);
			doc.doc=doc;
			addPost(doc);
		});
	};
	
	
	$scope.posts=[];
	$scope.showPosts = function(docs) {
		$scope.posts=docs.rows;		
		$scope.apply();
    };
    showPosts();
    
	
    $scope.orderBy = function(post) {
    	if(post.created)
    		return post.created;
    	else
    		return post.doc.created;
	};
	
}