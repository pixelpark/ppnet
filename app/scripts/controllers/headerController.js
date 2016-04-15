'use strict';

angular.module('ppnetApp')
    .controller('HeaderController', function($scope, ppnetConfig) {
        /* global hello */
        ppnetConfig.getInfo().then(function (result) {
            $scope.config = result;
        });
    });