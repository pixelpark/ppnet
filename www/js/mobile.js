
 var App = (function (app) {

	    'use strict';

	    app.Main = (function () {
	    	
	        // time in ms
	        var updateInterval = 10000;

	        function track() {
	            App.Geolocation.requestPosition();
	        }

	        function onDeviceReady() {
	            
	        	// Für 4.4.2 auf S4 kurz raus
	        	//track();
	            //setInterval(track, updateInterval);
	        	//App.Compass.startRequesting();
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