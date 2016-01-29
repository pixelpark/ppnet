'use strict';

angular.module('ppnetApp')
  .factory('ppnetConfig', function($http, $q, ppSyncService) {
    var config;
    var pending = true;
    var pendingArray = [];

    localStorage.removeItem('ppnetConfig');

    function loadConfigFromLocalStorage() {
      config = JSON.parse(localStorage.getItem('ppnetConfig'));
      return config;
    }

    function saveConfigtoLocalStorage(config) {
      localStorage.setItem('ppnetConfig', JSON.stringify(config));
    }

    function init(config) {
      /* SET CONFIG TO POUCHDB BEFORE INIT() */
      ppSyncService.setDB(config).then(function() {
        ppSyncService.init();
      });
    }
    
    
    function applyConfig (tmpConfig) {
      var deferred = $q.defer();
      config = tmpConfig;
      saveConfigtoLocalStorage(config);
      ppSyncService.setDB(config).then(function() {
        ppSyncService.init();
        deferred.resolve(config);
      });
      pending = false;
      var i = pendingArray.length-1;
      for (; i >= 0; --i) {
        pendingArray[i]();
      }
      pendingArray = [];
      return deferred.promise;
    }
    
    function init () {
      var tmpConfig = loadConfigFromLocalStorage();
      
      if (tmpConfig) {
        return applyConfig(tmpConfig);
      } else {
        return $http.get('config.json').then(function (res) {
          return applyConfig(res.data);
        });
      }
    }
    

    return {
      init : init,
      /*init: function(inputConfig) {
        // put load config from external here
        pending = false;
        var i = pendingArray.length-1;
        
        if (!inputConfig) {
          init(loadConfigFromLocalStorage());
        } else {
          config = inputConfig;
          saveConfigtoLocalStorage(inputConfig);
          init(config);
        }
        for (; i >= 0; --i) {
          pendingArray[i];
        }
      },*/
      existingConfig: function() {
        config = loadConfigFromLocalStorage();
        return (config) ? true : false;
      },
      /*loadConfig: function() {
        return loadConfigFromLocalStorage();
      },*/
      /*loadConfigFromExternal: function() {
        var deferred = $q.defer();
        $http.get('config.json').then(function(res) {
          deferred.resolve(res);
          deferred.reject(res);
          deferred.notify(res);
        });
        return deferred.promise;
      },*/
      /*saveConfig: function(config) {
        saveConfigtoLocalStorage(config);
      },*/
      getInfo : function () {
        var deferred = $q.defer();
        if (!pending && config) {
          deferred.resolve({
            name : config.name,
            version : config.version
          });
        } else {
          pendingArray.push(function () {
            deferred.resolve({
              name : config.name,
              version : config.version
            });
          });
        }
        return deferred.promise;
      },
      
      getLoginData: function() {
        var deferred = $q.defer();
        if (!pending && config) {
          deferred.resolve(config.login);
        } else {
          pendingArray.push(function () {
            deferred.resolve(config.login);
          });
        }
        return deferred.promise;
      },
      getMapviewData : function () {
        var deferred = $q.defer();
        if (!pending && config) {
          deferred.resolve(config.mapview);
        } else {
          pendingArray.push(function () {
            deferred.resolve(config.mapview);
          });
        }
        return deferred.promise;
      }
    };
  });