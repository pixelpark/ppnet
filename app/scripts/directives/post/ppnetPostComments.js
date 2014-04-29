'use strict';

angular.module('PPnet')
  .directive('ppnetPostComments', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/postComments.html'
    };
  });