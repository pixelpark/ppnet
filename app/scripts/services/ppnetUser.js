'use strict';

angular.module('ppnetApp')
  .factory('ppnetUser', function($http, $rootScope) {
    /* global routingConfig*/

    var accessLevels = routingConfig.accessLevels,
      userRoles = routingConfig.userRoles;


    var userAttributes = {
      id: null,
      name: null,
      provider: null,
      admin: false,
      online: false,
      role: userRoles.public
    };

    var initUser = function() {
      if (!localStorage.getItem('ppnetUser')) {
        $rootScope.user = userAttributes;
        //localStorage.setItem('ppnetUser', JSON.stringify($rootScope.user));
      } else {
        $rootScope.user = JSON.parse(localStorage.getItem('ppnetUser'));
      }

    };
    initUser();

    return {
      login: function(newUserData) {
        var user = {
          id: newUserData.id,
          name: newUserData.name,
          provider: newUserData.provider,
          online: true,
          role: userRoles.user
        };
        $rootScope.user = user;
        localStorage.setItem('ppnetUser', JSON.stringify($rootScope.user));
        window.location = '#/';
        return true;
      },
      logout: function() {
        $rootScope.user = userAttributes;
        localStorage.setItem('ppnetUser', JSON.stringify($rootScope.user));
      },

      isAdmin: function() {
        return ($rootScope.user.role === userRoles.admin) ? true : false;
      },
      toggleAdmin: function(status) {
        $rootScope.user.role = (status) ? userRoles.admin : userRoles.user;
        localStorage.setItem('ppnetUser', JSON.stringify($rootScope.user));
      },
      getUserData: function() {
        return $rootScope.user;
      },
      getName: function() {
        return $rootScope.user.name;
      },
      getId: function() {
        return $rootScope.user.id;
      },


      authorize: function(accessLevel, role) {
        if (role === undefined) {
          role = $rootScope.user.role;
        }
        return accessLevel & role;
      },
      isLoggedIn: function(user) {
        if (user === undefined) {
          user = $rootScope.user;
        }
        return user.role === userRoles.user || user.role === userRoles.admin;
      },

      accessLevels: accessLevels,
      userRoles: userRoles,
      user: $rootScope.user
    };

  }).directive('accessLevel', ['$rootScope', 'ppnetUser',
    function($rootScope, ppnetUser) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs, rootScope) {
          var prevDisp = element.css('display');
          $rootScope.$watch('user.role', function(role) {

            if (!ppnetUser.authorize(attrs.accessLevel)) {
              element.css('display', 'none');
            } else {
              element.css('display', prevDisp);
            }
          });
        }
      };
    }
  ]);