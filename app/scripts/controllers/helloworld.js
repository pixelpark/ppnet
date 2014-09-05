'use strict';

/**
 * @ngdoc function
 * @name ppnetApp.controller:HelloworldCtrl
 * @description
 * # HelloworldCtrl
 * Controller of the ppnetApp
 */
angular.module('ppnetApp')
  .controller('HelloworldCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
