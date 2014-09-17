'use strict';

angular.module('ppnetApp')
	.controller('LogoutController', function($scope, $location, ppnetUser) {
		/* global hello */
		hello().logout();
		ppnetUser.logout();
		$location.path('login');
	});