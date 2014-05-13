'use strict';

angular.module('PPnet')
  .directive('ppnetFooter', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/footer.html'
    };
  });