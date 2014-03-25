var app = angular.module('PPnet', ['ngSanitize', 'ngAnimate', 'ngRoute', 'snap', 'destegabry.timeline', 'angular-gestures', 'ppSync']);

app.controller('AppController', ['$scope', '$rootScope',
  function($scope, $rootScope) {
    $scope.apply = function() {
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    };

    $scope.snapopts = {
      touchToDrag: false,
      disable: 'right'
    };

    //new geoService($scope);
    $rootScope.postingPossible = false;

    $scope.$on("locationChanged", function(event, parameters) {
      alert(parameters);
      $scope.coords = parameters.coordinates;
    });

    ImgCache.init(function() {
      $scope.cache = true;
    }, function() {
      $scope.cache = false;
    });

    if (window.location.protocol === "file:") {
      $scope.phonegap = true;
    } else {
      $scope.phonegap = false;
    }

    new User($scope);

    if (!$scope.user.isLogedIn()) {
      window.location = '#/login';
    }

    /*
	 $scope.db.changes({
	 since:  'latest',
	 continuous: true,
	 include_docs: true,
	 onChange:  function(change) {}
	 });
	 */
    $scope.global_functions = {};

    if (window.localStorage.getItem("itemsToPush"))
      $scope.itemsToPush = JSON.parse(window.localStorage.getItem("itemsToPush"));
    else
      $scope.itemsToPush = new Array();

    $scope.$watch(function() {
      return $scope.global_functions.countItems();
    }, function(newValue, oldValue) {
      if (newValue == 0) {
        window.localStorage.setItem("itemsToPush", '');
      }
      if (newValue > 0) {
        $scope.global_functions.toReplicate();
      }
    });
    var toReplicate;
    $scope.global_functions.toReplicate = function() {
      console.log('CALL: toReplicate');
      if (toReplicate) {
        console.log('STOP FOR NEW: toReplicate');
        toReplicate.cancel();
      }

      console.log('START: toReplicate - ' + JSON.stringify($scope.itemsToPush));
      args = {
        doc_ids: $scope.itemsToPush,
        complete: function(err, result) {
          if (!err) {
            console.log('FINISH: toReplicate - ' + JSON.stringify($scope.itemsToPush));
            $scope.itemsToPush = new Array();
            $scope.$apply();
          } else {
            console.log('ERROR: toReplicate - ' + JSON.stringify($scope.itemsToPush));
          }
        }
      };
      toReplicate = $scope.db.replicate.to($scope.remoteCouch, args);;
    };

    $scope.global_functions.toPush = function(item) {

      if (item.length >= 1)
        $scope.itemsToPush = $scope.itemsToPush.concat(item);
      else
        $scope.itemsToPush.push(item.id);

      $scope.$apply();
      window.localStorage.setItem("itemsToPush", JSON.stringify($scope.itemsToPush));
    };
    $scope.global_functions.countItems = function() {
      if ($scope.itemsToPush)
        return $scope.itemsToPush.length;
      else
        return 0;
    };


    var watchID;
    var geoLoc;
    $scope.coords = {};

    function showLocation(position) {
      $scope.coords = position.coords;
      $scope.apply();
    }

    function errorHandler(err) {
      if (err.code == 1) {
        console.log("Error: Access is denied!");
      } else if (err.code == 2) {
        console.log("Error: Position is unavailable!");
      }
      delete $scope.coords.longitude;
      $scope.coords.longitude = null;
      delete $scope.coords.latitude;
      $scope.coords.latitude = null;
      delete $scope.coords.accuracy;
      $scope.coords.accuracy = null;
      $scope.apply();
    }

    function getLocationUpdate() {
      $scope.coords.longitude = null;
      $scope.coords.latitude = null;
      $scope.coords.accuracy = null;
      if (navigator.geolocation) {
        // timeout at 60000 milliseconds (60 seconds)
        var options = {
          timeout: 60000
        };
        geoLoc = navigator.geolocation;
        watchID = geoLoc.watchPosition(showLocation, errorHandler, options);
      } else {
        console.log("Sorry, browser does not support geolocation!");
      }
    }

    function stopWatch() {
      geoLoc.clearWatch(watchID);
    }

    if ($scope.phonegap)
      document.addEventListener("deviceready", getLocationUpdate, false);
    else
      jQuery(document).ready(function() {
        getLocationUpdate();
      });


    Offline.options = {
      checks: {
        image: {
          url: 'http://www.pixelpark.com/system/modules/com.pixelpark.pponline.frontend/resources/img/glb/btn_up.gif'
        },
        active: 'image'
      }
    }

    console.log(Offline.check());

    Offline.on('up', function() {
      console.log('a');
      //if ($scope.global_functions.countItems() > 0) {
      //    $scope.global_functions.toReplicate();
      //}
    }, '');
  }
]);