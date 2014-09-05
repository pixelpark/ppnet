'use strict';

angular.module('ppnetApp')
  .directive('ppnetFooter', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/footer.html'
    };
  });