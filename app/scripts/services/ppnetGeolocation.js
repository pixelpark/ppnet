'use strict';

angular.module('ppnetApp')
  .factory('ppnetGeolocation', function() {

    var watchID;
    var coords = {};

    var showPosition = function(position) {
      coords.latitude = position.coords.latitude;
      coords.longitude = position.coords.longitude;
      coords.accuracy = position.coords.accuracy;
      saveKeyToLocalStorage('ppnetLocation', coords);
      var i = listeners.length-1;
      for (; i >= 0; --i) {
        listeners[i](coords);
      }
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
      saveKeyToLocalStorage('ppnetLocation', coords);
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
    
    var saveKeyToLocalStorage = function (key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    };
    
    var loadKeyFromLocalStorage = function (key) {
      return JSON.parse(localStorage.getItem(key));
    };
    
    var listeners = [];

    return {
      register : function (func) {
        listeners.push(func);
      },
      unregister : function (func) {
        var i = listeners.length-1;
        for (; i >= 0; --i) {
          if (listeners[i] === func) {
            return listeners.splice(i,1);
          }
        }
      },
      getCurrentUserPosition: function() {
        var position = loadKeyFromLocalStorage('ppnetLocation');
        return (position === null || (position.latitude === null && position.longitude === null)) ? false : position;
      },
      setCurrentMapLocation: function(position) {
        saveKeyToLocalStorage('ppnetMapPosition', position);
      },
      getCurrentMapLocation: function() {
        var position = loadKeyFromLocalStorage('ppnetMapPosition');
        return (position === null || (position.latitude === null && position.longitude === null)) ? false : position;
      },

      getCurrentCoords: function() {
        return coords;
      },
      startGeoWatch: function() {
        getLocationUpdate();
      }
    };
  });