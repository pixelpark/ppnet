'use strict';

angular.module('ppnetApp')
  .directive('ppnetMashupItem', function($timeout) {
    return {
      restrict: 'AE',
      link: function(scope, element) {
        /* global $ */
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