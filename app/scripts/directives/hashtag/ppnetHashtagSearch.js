'use strict';

angular.module('ppnetApp')
  .directive('ppnetHashtagSearch', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/hashtagSearch.html'
    };
  });