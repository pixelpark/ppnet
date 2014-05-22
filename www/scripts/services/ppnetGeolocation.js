'use strict';

angular.module('PPnet')
  .factory('ppnetGeolocation', function() {

    var watchID;
    var coords = {};

    var showPosition = function(position) {
      coords.latitude = position.coords.latitude;
      coords.longitude = position.coords.longitude;
      coords.accuracy = position.coords.accuracy;
      saveCurrentLocationtoLocalStorage();
    };

    var errorHandler = function(err) {
      if (err.code === 1) {
        console.log('Error: Access is denied!');
      } else if (err.code === 2) {
        console.log('Error: Position is unavailable!');
      }
      coords.latitude = null;
      coords.longitude = null;
      coords.accuracy = null;
      saveCurrentLocationtoLocalStorage();
    };

    var getLocationUpdate = function() {
      coords.latitude = null;
      coords.longitude = null;
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
    var loadCurrentPositionFromLocalStorage = function() {
      return JSON.parse(localStorage.getItem('ppnetLocation'));;
    };

    var saveCurrentMapPositionToLocalStorage = function(position) {
      localStorage.setItem('ppnetMapPosition', JSON.stringify(position));
    };
    var loadCurrentMapPositionFromLocalStorage = function(position) {
      return JSON.parse(localStorage.getItem('ppnetMapPosition'));;
    };

    return {
      getCurrentUserPosition: function() {
        var position = loadCurrentPositionFromLocalStorage();
        if (position.latitude == null && position.longitude == null)
          return false;
        return position;
      },
      setCurrentMapLocation: function(position) {
        saveCurrentMapPositionToLocalStorage(position);
      },
      getCurrentMapLocation: function() {
        return loadCurrentMapPositionFromLocalStorage();
      },

      getCurrentCoords: function() {
        return coords;
      },
      startGeoWatch: function() {
        getLocationUpdate();
      }
    };
  });