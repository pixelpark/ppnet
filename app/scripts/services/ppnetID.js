'use strict';

angular.module('ppnetApp').factory('ppnetID', function($cookies) {
    return {
        init : function (token) {
            $cookies.put('test', 'token');
        }
    };
});