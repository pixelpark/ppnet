'use strict';

angular.module('ppnetApp')
  .directive('ppnetPostFulltime', function($filter) {
    var time = function(time) {
      time = moment.unix(time / 1000).format('LLL');
      return time;
    };

    return {
      restrict: 'E',
      scope: {
        time: '=time'
      },
      link: function(scope) {
        scope.ppnetPostFulltime = time(scope.time);
      },
      template: '<span ng-bind="ppnetPostFulltime"></span>'
    };
  });