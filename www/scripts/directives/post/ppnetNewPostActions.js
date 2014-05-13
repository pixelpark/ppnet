'use strict';

angular.module('PPnet')
  .directive('ppnetNewPostActions', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/newPostActions.html',
      controller: 'PostActionsController'
    };
  });