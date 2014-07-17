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

        $scope.logoutButtonClick = function() {
            $scope.isLogedIn = false;
        };

        $scope.$watch(
            function() {
                return ppnetUser.isLogedIn();
            },
            function(newValue, oldValue) {
                if (newValue) {
                    $scope.isLogedIn = newValue;
                }
            }
        );

        var setHeader = function(config) {
            $scope.config = config;
        }
    });