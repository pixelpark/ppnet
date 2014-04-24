'use strict';

angular.module('PPnet')
  .controller('AdminDebugController', function($scope, ppSyncService, ppnetUser) {

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
    };

  });