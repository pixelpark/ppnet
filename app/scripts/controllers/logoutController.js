'use strict';

angular.module('ppnetApp')
	.controller('LogoutController', function($scope, $location, ppnetUser) {
		hello().logout();
		ppnetUser.logout();
		$location.path('login');
	});