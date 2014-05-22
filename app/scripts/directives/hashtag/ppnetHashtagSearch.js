'use strict';

angular.module('PPnet')
  .directive('ppnetHashtagSearch', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/hashtagSearch.html'
    };
  });