'use strict';

angular.module('PPnet')
  .directive('ppnetHeader', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/header.html'
    };
  });