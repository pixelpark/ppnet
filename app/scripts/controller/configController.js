'use strict';
angular.module('PPnet')
    .controller('configController', function($scope, $location, $routeParams, ppnetConfig, ppnetUser) {

        $scope.$watch(
            function() {
                return ppnetConfig.existingConfig();
            },
            function(newValue, oldValue) {
                if (newValue) {
                    setHeader(ppnetConfig.loadConfig());
                }
            }
        );

        $scope.isLogedIn = ppnetUser.isLogedIn();
        console.log($scope.isLogedIn);

        var setHeader = function(config) {
            $scope.config = config;
        }
    });