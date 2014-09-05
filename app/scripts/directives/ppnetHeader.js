'use strict';

angular.module('ppnetApp')
  .directive('ppnetHeader', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/header.html'
    };
  });