'use strict';

angular.module('ppnetApp')
  .directive('ppnetAdminDebug', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/adminDebug.html',
      controller: 'AdminDebugController'
    };
  });