'use strict';

angular.module('ppnetApp')
	.directive('ppnetNewCodecatchActions', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/partials/newCodecatchActions.html',
			controller: 'CodecatchActionsController'
		};
	});