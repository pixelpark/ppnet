'use strict';


angular.module('PPnet')
  .directive('ppnetPostMeta', function() {
    return {
      restrict: 'E',
      templateUrl: 'views/partials/postMeta.html',
      controller: 'PostMetaController'
    };
  });