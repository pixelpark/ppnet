'use strict';

angular.module('PPnet')
  .directive('ppnetNewCommentForm', function() {
    return {
      restrict: 'E',
      scope: {
        postId: '=postId'
      },
      templateUrl: 'views/partials/newComment.html',
      controller: 'NewCommentController'
    };
  });