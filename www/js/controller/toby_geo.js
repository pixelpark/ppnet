function GeoController($scope){
		
	var doc, coords,network;
	$scope.apply 	= function() {if(!$scope.$$phase) {$scope.$apply();}};
	
	
	

	
	var db = new PouchDB('ppnet_geo');
	//var remoteCouch = 'https://ppnet:pixelpark@ppnet.cloudant.com/ppnet';
	//var remoteCouch = 'http://10.50.1.46:5984/ppnet';
	var remoteCouch = 'http://couchdb.simple-url.com:5984/ppnet_geo';
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
						  	$scope.getGeo(change.id);
						 }else{
						 	showGeos();
						 }
					  }
				  	});

	}
	if (remoteCouch){sync();}
	
	
	function showGeos(){
		db.allDocs({include_docs: true, descending: true}, function(err, docs) {
			$scope.showGeos(docs);
	    });	
	}
	function timeConverter(timestamp){
		 var a = new Date(timestamp);
		 var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		     var year = a.getFullYear();
		     var month = months[a.getMonth()];
		     var date = a.getDate();if(date){date='0'+date;}
		     var hour = a.getHours();if(hour<10){hour='0'+hour;}
		     var min = a.getMinutes();if(min<10){min='0'+min;}
		     var sec = a.getSeconds();if(sec<10){sec='0'+sec;}
		     var time = date+' '+month+' '+year+' '+hour+':'+min+':'+sec ;
		     return time;
	}


	function createGeo() {			
				doc = {
						created : new Date().getTime(),
						formattedTime : timeConverter( new Date().getTime()),
						latitude: coords.latitude,
						longitude: coords.longitude,            
						altitude: coords.altitude,            
						accuracy: coords.accuracy,
						altitudeAccuracy: coords.altitudeAccuracy,  
						heading: coords.heading,
						network: network,
						device_model:device.model,
						device_cordova:device.cordova,
						device_platform:device.platform,
						device_uuid:device.uuid,
						device_version:device.version,
						device_name:device.name,
						compass:compass
				}	

				db.post(doc, function (err, response) {
					console.log(err || response);
				});
	}

	function addGeo(doc) {
		console.log('addGeo');
		$scope.geos.push(doc);
		$scope.apply();
	};

	$scope.getGeo = function(id) {
		db.get(id, function(err, doc) {
			console.log(doc);
			if(doc){
				doc.doc=doc;
				addGeo(doc);
			}
		});
	};

	
	
	$scope.geos=[];
	$scope.showGeos = function(docs) {
		$scope.geos=docs.rows;		
		$scope.apply();
    };
    showGeos();
    
	
    $scope.orderByFunction = function(geo) {
    	if(geo.created)
    		return geo.created;
    	else if(geo.doc.created)
    		return geo.doc.created;
    	else
    		return 99999
	};
	

	function checkConnection() {
	    var networkState = navigator.connection.type;

	    var states = {};
		    states[Connection.UNKNOWN]  = 'Unknown connection';
		    states[Connection.ETHERNET] = 'Ethernet connection';
		    states[Connection.WIFI]     = 'WiFi connection';
		    states[Connection.CELL_2G]  = 'Cell 2G connection';
		    states[Connection.CELL_3G]  = 'Cell 3G connection';
		    states[Connection.CELL_4G]  = 'Cell 4G connection';
		    states[Connection.CELL]     = 'Cell generic connection';
		    states[Connection.NONE]     = 'No network connection';

	    network=states[networkState];
	}

	

	
    
	function onSuccess(position) {
		coords={
				latitude: position.coords.latitude,
				longitude: position.coords.longitude,            
				altitude: position.coords.altitude,            
				accuracy: position.coords.accuracy,
				altitudeAccuracy: position.coords.altitudeAccuracy,  
				heading: position.coords.heading,  
				timestamp: position.timestamp, 
		}
    }
    function onError(error) {
    	coords=null;
    }
    
    
    
    var compass;
    function compassOnSuccess(heading) {
    	compass=heading.magneticHeading;
    };
    function compassOnError(compassError) {};
    
    
    
if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
	console.log('mobile');	
	window.setInterval(function(){  
		checkConnection();
		
		navigator.compass.getCurrentHeading(compassOnSuccess, compassOnError);

    	navigator.geolocation.getCurrentPosition(onSuccess, onError);
	}, 1000);
	
	window.setInterval(function(){  
		createGeo();
	}, 10000);
}else{
	console.log('no mobile');
}
    
	
	/*
	var ENTER_KEY = 13;
  	var newTodoDom = document.getElementById('new-geo');
	function addEventListeners() {
    	newTodoDom.addEventListener('keypress', createGeo, false);
  	}
  	addEventListeners();
  	*/
}