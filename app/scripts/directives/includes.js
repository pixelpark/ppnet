'use strict';

angular.module('PPnet')
  .directive('ppnetMenu', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/menu.html'
    };
  })
  .directive('ppnetMenuMobile', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/menu_mobile.html'
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
      restrict: 'C',
      templateUrl: 'views/partials/posting_actions.html'
    };
  });