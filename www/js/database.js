function Database ($scope) {   
	//new PostingController();
	
    $scope.db = new PouchDB('ppnet');
	var remoteCouch = 'http://couchdb.simple-url.com:5984/ppnet';
	function sync() {
		  var opts = {continuous: true};
		  $scope.db.replicate.from(remoteCouch, opts);
		  $scope.db.replicate.to(remoteCouch, opts);
	};
	if (remoteCouch){sync();}
	//return $scope;
}

