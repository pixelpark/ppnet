'use strict';


angular.module('PPnet')
  .directive('ppnetCropImage', function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        scope.$watch(function() {
          scope.height = element.height();
        });

        scope.$watch('height', function() {
          if (scope.height > 200 && attrs.crop === 'true') {
            var margin = (scope.height - 200) / 2;
            element.css('margin-top', -margin);
          }
        });
      }
    };
  });