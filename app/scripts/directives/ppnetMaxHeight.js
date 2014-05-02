'use strict';

angular.module('PPnet')
  .directive('ppnetMaxHeight', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        console.log(element);
        var newHeight = window.innerHeight - 48;
        element.height(newHeight);
      }
    };
  });