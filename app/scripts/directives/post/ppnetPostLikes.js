'use strict';

angular.module('PPnet')
  .directive('ppnetPostLikes', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/postLikes.html',
      controller: 'PostLikeController'
    };
  });