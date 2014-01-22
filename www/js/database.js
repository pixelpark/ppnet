function Database ($scope) {   
	//new PostingController();
	
    $scope.db = new PouchDB('ppnet');

	//AMAZON
	var remoteCouch = 'http://107.20.67.201:5984/ppnet';
	
	//FI-Ware
	//var remoteCouch = ' http://130.206.83.238:5984/ppnet';	
	
	//var remoteCouch = 'http://couchdb.simple-url.com:5984/ppnet';
		
	function sync() {
		  var opts = {continuous: true};
		  $scope.db.replicate.from(remoteCouch, opts);
		  $scope.db.replicate.to(remoteCouch, opts);
	};
	if (remoteCouch){sync();}
}

