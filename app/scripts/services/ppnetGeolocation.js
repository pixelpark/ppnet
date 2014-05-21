'use strict';

angular.module('PPnet')
  .factory('ppnetGeolocation', function() {

    var watchID;
    var coords = {};

    var showPosition = function(position) {
      coords.longitude = position.coords.longitude;
      coords.latitude = position.coords.latitude;
      coords.accuracy = position.coords.accuracy;
      saveCurrentLocationtoLocalStorage();
    };

    var errorHandler = function(err) {
      if (err.code === 1) {
        console.log('Error: Access is denied!');
      } else if (err.code === 2) {
        console.log('Error: Position is unavailable!');
      }
      coords.longitude = null;
      coords.latitude = null;
      coords.accuracy = null;
      saveCurrentLocationtoLocalStorage();
    };

    var getLocationUpdate = function() {
      coords.longitude = null;
      coords.latitude = null;
      coords.accuracy = null;
      if (navigator.geolocation) {
        // timeout at 60000 milliseconds (60 seconds)
        var options = {
          timeout: 60000
        };
        watchID = navigator.geolocation.watchPosition(showPosition, errorHandler, options);
      } else {
        console.log('Sorry, browser does not support geolocation!');
      }
    };
    var saveCurrentLocationtoLocalStorage = function() {
      localStorage.setItem('ppnetLocation', JSON.stringify(coords));
    };

    return {
      loadCurrentLatitudeFromLocalStorage: function() {
        var temp_coords = JSON.parse(localStorage.getItem('ppnetLocation'));
        return temp_coords.latitude;
      },
      loadCurrentLongitudeFromLocalStorage: function() {
        var temp_coords = JSON.parse(localStorage.getItem('ppnetLocation'));
        return temp_coords.longitude;
      },
      getCurrentCoords: function() {
        return coords;
      },
      startGeoWatch: function() {
        getLocationUpdate();
      }
    };
  });