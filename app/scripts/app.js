var app = angular.module('PPnet', ['ngSanitize', 'ngAnimate', 'ngRoute', 'angular-gestures', 'ppSync', 'destegabry.timeline']);

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

    $scope.user = new User();
    if (!$scope.user.isLogedIn()) {
      window.location = '#/login';
    }

    $scope.global_functions = {};

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

  }
]);