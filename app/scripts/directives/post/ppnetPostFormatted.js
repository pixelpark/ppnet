'use strict';

angular.module('PPnet')
  .directive('ppnetPostFormatted', function($filter) {
    function hashtag(text) {
      return text.replace(/(^|\s)(#[a-zA-ZöüäÖÜÄß\-\d-]+)/gi, function(t) {
        return ' ' + t.link("#/hashtag/" + t.replace("#", "").trim()).trim();
      });
    }

    return {
      restrict: 'AE',
      link: function(scope, element, attrs) {
        scope.message = $filter('linky')(scope.message);
        scope.message = hashtag(scope.message);
      },
      scope: {
        message: '=message'
      },
      template: '<p class="post-content" ng-bind-html="message"></p>'
    };
  });