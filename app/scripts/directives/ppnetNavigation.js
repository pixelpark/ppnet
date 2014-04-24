'use strict';

angular.module('PPnet')
  .directive('ppnetNavigation', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/navigation.html'
    };
  });