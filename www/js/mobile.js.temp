
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