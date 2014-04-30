'use strict';


angular.module('PPnet')
  .directive('ppnetCropImage', function() {
    return {
      restrict: 'A',
      link: function(scope, element) {

        scope.$watch(function() {
          scope.height = element.height();
        });

        scope.$watch('height', function() {
          if (scope.height > 200) {
            var margin = (scope.height - 200) / 2;
            element.css('margin-top', -margin);
          }
        });
      }
    };
  });