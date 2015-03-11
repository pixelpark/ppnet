'use strict';

angular.module('ppnetApp')
	.directive('ppnetNewPostActions', function() {
		return {
			restrict: 'E',
			templateUrl: 'views/partials/newPostActions.html',
			controller: 'PostActionsController'
		};
	});