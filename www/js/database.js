function Database ($scope) {   
	//new PostingController();
	
    $scope.db = new PouchDB('ppnet', {auto_compaction: true});
    //$scope.db = new PouchDB('ppnet');

	//AMAZON
	$scope.remoteCouch = 'http://107.20.67.201:5984/ppnet';
	
	//FI-Ware
	//var remoteCouch = 'http://130.206.83.238:5984/ppnet';	
	
 	
	//var remoteCouch = 'http://couchdb.simple-url.com:5984/ppnet';
	
	// Function for continuous sync
	var sync = function(){
		console.log('sync');
		var opts = {
			continuous: true
		};
		$scope.db.replicate.from($scope.remoteCouch, opts);
		//$scope.db.replicate.to($scope.remoteCouch, opts);
	};

	// Inital Replication from remote to local (data-subset: only POSTs not older than 24hours)
	var initialReplicateFrom = function(){
		console.log('initialReplicateFrom');
		var args = {
			since: 'latest',
			complete: function(){
				sync();
			},
			change: function(){
				console.log($scope.db);
			},
			filter: function(doc, req) {
				var oldest_timestamp = new Date().getTime() - (86400*1000);
				//if (doc.created > oldest_timestamp && doc.type && doc.type == "POST") {
				if (doc.created > oldest_timestamp) {
					return true;
				} else {
					return false;
				}
			}
		};
		$scope.db.replicate.from($scope.remoteCouch, args);
	};

	// Inital Replication from local to remote (no data-subset)
	// After Replication call the continious sync function
	var initialReplicateTo = function(){
		console.log('initialReplicateTo');
		args = {
			since: 'latest',
			complete: function(){
				sync();
				// TODO Call the db.changes method to watch changes
			}
		};
		$scope.db.replicate.to($scope.remoteCouch, args);
	};

	if($scope.remoteCouch){
		initialReplicateFrom();
	}
	Offline.on('up', function(){
		initialReplicateFrom();
	},'');
}

