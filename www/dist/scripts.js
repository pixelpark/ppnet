angular.element(document).ready(function() {

});
var app = angular.module('PPnet',['ngSanitize','ngAnimate','ngRoute']);

app.controller('AppController', ['$scope', '$location',  function($scope, $location) {

	new Database($scope);
	new User($scope);


	if(!$scope.user.isLogedIn()){
		window.location='#/login';
	}

 	$scope.db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {

					  }
	});
 
}]);
(function( window ) {
	'use strict';


})( window );

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


function stickyActionBar() {
	setTimeout(function(){
		jQuery('#posting_actions').waypoint('sticky');
	}, 1500)
}


 var App = (function (app) {

	    'use strict';

	    app.Main = (function () {
	    	
	        // time in ms
	        var updateInterval = 1000;

	        function track() {
	            App.Geolocation.requestPosition();
	            App.Compass.requestHeading();

	        }

	        function onDeviceReady() {
	            
	        	// Für 4.4.2 auf S4 kurz raus
	        	//track();
	            //phonesetInterval(track, updateInterval);
	        }

	        function init() {
	        	onDeviceReady();
	        }

	        return {
	            init: init
	        };
	    }());

	    return app;

	}(App || {}));

	jQuery(function () {
	    'use strict';
	    App.Main.init();
	});
app.config(['$routeProvider', function($routeProvider) {
	
	
	$routeProvider.when('/posting', {
      templateUrl: 'html/posting.html'
    });
    
    
	$routeProvider.when('/hashtag/:hashtag', {
      templateUrl: 'html/hashtag.html'
    });
    
    $routeProvider.when('/hashtag', {
      templateUrl: 'html/hashtag.html'
    });
    
    
	$routeProvider.when('/login', {
      templateUrl: 'html/login.html'
    });


    
    $routeProvider.when('/user/:task', {
      controller: 'UserController',
      template : ''
    });
    

    
    $routeProvider.otherwise({redirectTo: '/posting'});
    
}]); 


app.controller('UserController', function($scope, $routeParams, $location) {
	$scope.showMenu=false;
	
	
	if ($routeParams.task=='logout'){
		window.localStorage.clear();
		$scope.user.name=null;
		$scope.user.id=null;
		window.location='#/login';
	}
	
	if ($routeParams.task=='login'){
		window.localStorage.setItem("user.name", $scope.user.name);
		window.localStorage.setItem("user.id", $scope.user.id);
		window.location='#/posting';
	}

});	
	
	
function User($scope){
	$scope.user = {vars:{}};
	$scope.user.id = window.localStorage.getItem("user.id");
	$scope.user.name = window.localStorage.getItem("user.name");
	
	
	$scope.user.login = function(){
		if($scope.user.name && $scope.user.id){
			 window.location='#/user/login';
		}else{
			
		}
	};
	
	$scope.user.isLogedIn = function(){
		return (window.localStorage.getItem("user.id"))?true:false;
	};
	
	$scope.user.getName = function(){
		return $scope.user.name;
	};
	$scope.user.getId = function(){
		return $scope.user.id;
	};
}