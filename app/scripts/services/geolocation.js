angular.module('PPnet')
  .service('geolocation', function() {
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
  });