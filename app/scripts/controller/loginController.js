'use strict';

angular.module('PPnet')
  .controller('LoginController', function($scope, ppnetUser, $location) {

    // Login a user with random credentials. Only for Debugging.
    $scope.login = function() {
      var newUser = {
        id: Math.ceil(Math.random() * 10000),
        name: 'User' + Math.ceil(Math.random() * 10000),
        provider: 'local'
      }
      if (ppnetUser.login(newUser)) {
        $location.path('');
      }
    };

  });