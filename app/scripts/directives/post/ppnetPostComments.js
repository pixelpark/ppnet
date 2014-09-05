'use strict';

angular.module('ppnetApp')
  .directive('ppnetPostComments', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/postComments.html'
    };
  });