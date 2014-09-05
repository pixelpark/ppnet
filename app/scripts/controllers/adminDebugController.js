'use strict';

angular.module('ppnetApp')
  .controller('AdminDebugController', function($scope, ppSyncService, ppnetUser, ppnetGeolocation) {

    $scope.isAdmin = ppnetUser.isAdmin();

    $scope.resetDatabase = function() {
      ppSyncService.reset();
    };

    $scope.getDatabaseInfo = function() {
      ppSyncService.debug().then(function(response) {
        console.log(response);
      });
    };

    $scope.debugUserData = function() {
      console.log(ppnetUser.getUserData());
      console.log(ppnetUser.isAdmin());
    };

    $scope.debugGeolocation = function() {
      console.log(ppnetGeolocation.getCurrentCoords());
    };

  });