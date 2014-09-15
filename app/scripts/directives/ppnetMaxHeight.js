'use strict';

angular.module('ppnetApp')
	.directive('ppnetMaxHeight', function() {
		return {
			restrict: 'A',
			link: function(scope, element) {
				var newHeight = window.innerHeight - 48;
				element.height(newHeight);
			}
		};
	});