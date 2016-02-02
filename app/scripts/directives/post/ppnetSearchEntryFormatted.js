'use strict';
angular.module('ppnetApp').directive('ppnetSearchEntryFormatted', function ($filter) {
    return {
        restrict: 'A',
        scope: {
            message: '=message'
        },
        link: function (scope) {
            if (!angular.isUndefined(scope.message)) {
                scope.message = $filter('linky')(scope.message).replace(/\&lt;strong\&gt;/g, '<strong>').replace(/\&lt;\/strong\&gt;/g, '</strong>');
            }
        },
        template: '<span ng-bind-html="message"></span>'
    };
});