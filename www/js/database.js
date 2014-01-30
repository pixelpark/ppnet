function Database ($scope) {   
	//new PostingController();
	
    $scope.db = new PouchDB('ppnet', {auto_compaction: true});
    //$scope.db = new PouchDB('ppnet');

    $scope.db.info(function(err, info) {
		console.log(info);
    });

	//AMAZON
	var remoteCouch = 'http://107.20.67.201:5984/ppnet';
	
	//FI-Ware
	//var remoteCouch = 'http://130.206.83.238:5984/ppnet';	
	
	//var remoteCouch = 'http://couchdb.simple-url.com:5984/ppnet';


	// Function for continuous sync
	var sync = function(){
		var opts = {
			continuous: true
		};
		console.log('continuous Replicate FROM');
		$scope.db.replicate.from(remoteCouch, opts);
		console.log('continuous Replicate TO');
		$scope.db.replicate.to(remoteCouch, opts);
	};

	// Inital Replication from remote to local (data-subset: only POSTs not older than 24hours)
	var initialReplicateFrom = function(){
		var args = {
			continuous: false,
			complete: function(){
				sync();
			},
			filter: function(doc, req) {
				var oldest_timestamp = new Date().getTime() - (86400*1000);
				if (doc.created > oldest_timestamp && doc.type && doc.type == "POST") {
					return true;
				} else if(doc.created > oldest_timestamp && doc.type && doc.type == "LIKE"){
					return true;
				} else if(doc.created > oldest_timestamp && doc.type && doc.type == "COMMENT"){
					return true;
				} else {
					return false;
				}
			}
		};
		console.log('Initial Replicate FROM');
		$scope.db.replicate.from(remoteCouch, args);
	};

	// Inital Replication from local to remote (no data-subset)
	// After Replication call the continious sync function
	var initialReplicateTo = function(){
		args = {
			complete: function(){
				sync();
			}
		};
		console.log('Initial Replicate TO');
		$scope.db.replicate.to(remoteCouch, args);
	};

	if(remoteCouch){
		initialReplicateFrom();
	}
	//if (remoteCouch){sync();}
}
