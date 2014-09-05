'use strict';
angular.module('ppnetApp')
  .controller('LoadController', function($scope, $location, $routeParams, ppnetConfig, ppSyncService) {

    ppnetConfig.loadConfigFromExternal().then(function(response) {
        ppnetConfig.init(response.data);
      },
      function(error) {
        console.log(error);
      },
      function(change) {
        console.log(change);
      });
  });