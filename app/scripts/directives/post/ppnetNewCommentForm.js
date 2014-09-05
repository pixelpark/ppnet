'use strict';

angular.module('ppnetApp')
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