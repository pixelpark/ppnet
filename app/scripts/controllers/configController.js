'use strict';
angular.module('ppnetApp')
  .controller('configController', function($scope, $location, $routeParams, ppnetConfig, ppnetUser) {
    $scope.user = ppnetUser.user;
    $scope.userRoles = ppnetUser.userRoles;
    $scope.accessLevels = ppnetUser.accessLevels;

    $scope.$watch(
      function() {
        return ppnetConfig.existingConfig();
      },
      function(newValue) {
        if (newValue) {
          $scope.config = ppnetConfig.loadConfig();
        }
      }
    );


    $scope.onConnect = function() {
      console.log('$scope.onConnect');
    };

    $scope.onDisconnect = function() {
      console.log('$scope.onDisconnect');
    };
  });