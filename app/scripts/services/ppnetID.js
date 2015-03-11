'use strict';

angular.module('ppnetApp').factory('ppnetID', function($cookies) {
    return {
        init : function () {
            $cookies.token = 'abc123';
        }
    };
});