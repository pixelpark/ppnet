'use strict';

angular.module('PPnet')
  .directive('ppnetAdminDebug', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/adminDebug.html',
      controller: 'AdminDebugController'
    };
  });