'use strict';

angular.module('ppnetApp')
	.directive('ppnetPostFormatted', function($filter) {
		var hashtag = function(text) {
			return text.replace(/(^|\s)(#[a-zA-ZöüäÖÜÄß\-\d-]+)/gi, function(t) {
				return ' ' + t.link('#/hashtag/' + t.replace('#', '').trim()).trim();
			});
		};

		return {
			restrict: 'E',
			scope: {
				message: '=message'
			},
			link: function(scope) {
				if (!angular.isUndefined(scope.message)) {
					scope.message = $filter('linky')(scope.message);
					scope.message = hashtag(scope.message);
				}
			},
			template: '<p ng-bind-html="message"></p>'
		};
	});