'use strict';

angular.module('PPnet')
  .directive('ppnetMashupItem', function($timeout) {
    return {
      restrict: 'AE',
      link: function(scope, element, attrs) {
        if (scope.$last) {
          $timeout(function() {
            scope.$emit('MashupImagesLoaded');
          });
        }
        $(element).click(function() {
          $(this).toggleClass('highlight');
          $('.mashup_wrapper').isotope('layout');
        });
      }
    };
  });