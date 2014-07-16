'use strict';
angular.module('PPnet')
    .controller('configController', function($scope, $location, $routeParams, ppnetConfig) {

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

        var setHeader = function(config) {
            $scope.config = config;
        }
    });