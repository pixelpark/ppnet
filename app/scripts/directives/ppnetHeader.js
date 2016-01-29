'use strict';

angular.module('ppnetApp')
  .directive('ppnetHeader', function(ppnetConfig, ppnetUser) {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/header.html',
      scope : {},
      link : function (scope) {
        scope.accessLevels = ppnetUser.accessLevels;
        
        ppnetConfig.getInfo().then(function (result) {
          scope.config = result;
        });
      }
    };
  });