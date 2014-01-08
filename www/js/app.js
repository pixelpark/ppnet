 function AppController($scope) {
    $scope.header =[{ name: 'header.html', url: 'html/header.html'}]
    $scope.header = $scope.header[0];
    
    
    $scope.template =[
                      { name: 'posting.html', url: 'html/posting.html'}
                      ]
    $scope.template = $scope.template[0];
    
    $scope.footer =[{ name: 'footer.html', url: 'html/footer.html'}]
    $scope.footer = $scope.footer[0];
    
    $scope.geolocation =[{ name: 'geolocation.html', url: 'html/geolocation.html'}]
    $scope.geolocation = $scope.geolocation[0];
}
 
 var App = (function (app) {

	    'use strict';

	    app.Main = (function () {

	        // time in ms
	        var updateInterval = 10000;

	        function track() {
	            App.Geolocation.requestPosition();
	        }

	        function onDeviceReady() {
	            track();
	            setInterval(track, updateInterval);

	            App.Compass.startRequesting();
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