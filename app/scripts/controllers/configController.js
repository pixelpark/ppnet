'use strict';
angular.module('ppnetApp')
  .controller('configController', function($scope, $location, $routeParams, ppnetConfig, ppnetUser) {

    $scope.$watch(
      function() {
        return ppnetConfig.existingConfig();
      },
      function(newValue, oldValue) {
        if (newValue) {
          $scope.config = ppnetConfig.loadConfig();
        }
      }
    );
  });