'use strict';

angular.module('ppnetApp')
	.controller('LogoutController', function(/*$location,*/ ppnetUser/*,PermissionStore*/, $state) {
		/* global hello */
		if(ppnetUser.logout()){
			$state.go('login');
		}
	});