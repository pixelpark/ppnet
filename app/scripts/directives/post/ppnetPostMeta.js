'use strict';


angular.module('ppnetApp')
	.directive('ppnetPostMeta', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/partials/postMeta.html',
			controller: 'PostMetaController'
		};
	});