'use strict';

angular.module('PPnet')
  .directive('ppnetMenu', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/navigation.html'
    };
  })
  .directive('ppnetHeader', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/header.html'
    };
  })
  .directive('ppnetFooter', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/footer.html'
    };
  })
  .directive('ppnetPostingActions', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/postActions.html'
    };
  });