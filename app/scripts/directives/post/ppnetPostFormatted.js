'use strict';

angular.module('ppnetApp')
	.directive('ppnetPostFormatted', function($filter) {
		/*var hashtag = function(text) {
            console.log(text);
			return text.replace(/(^|\s)(#[a-zA-ZöüäÖÜÄß\-\d-]+)/gi, function(t) {
                console.log(t);
				return ' ' + t.link('#/hashtag/' + t.replace('#', '').trim()).trim();
			});
		};*/

		return {
			restrict: 'E',
			scope: {
				message: '=message'
			},
			link: function(scope) {
				if (!angular.isUndefined(scope.message)) {
                    scope.message = $filter('parseUrlFilter')(scope.message);
				}
			},
			template: '<span ng-bind-html="message"></span>'
		};
	});