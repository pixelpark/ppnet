'use strict';

angular.module('ppnetApp')
  .factory('ppnetUser', function() {
    /* global routingConfig*/
    /*jslint bitwise: true */

    var accessLevels = routingConfig.accessLevels,
      userRoles = routingConfig.userRoles;


    var userAttributes = {
      id: '',
      name: '',
      provider: '',
      admin: false,
      online: false,
      role: userRoles.public
    };
    var currentUser;
    var initUser = function() {
      if (!localStorage.getItem('ppnetUser')) {
        currentUser = userAttributes;
      } else {
        currentUser = JSON.parse(localStorage.getItem('ppnetUser'));
      }
    };
    initUser();

    function changeUser(user) {
      angular.extend(currentUser, user);
      localStorage.setItem('ppnetUser', JSON.stringify(user));
    }

    return {
      login: function(newUserData) {
        var user = {
          id: newUserData.id,
          name: newUserData.name,
          provider: newUserData.provider,
          online: true,
          role: userRoles.user
        };
        changeUser(user);
        window.location = '#/';
        return true;
      },
      logout: function() {
        changeUser(userAttributes);

      },
      toggleAdmin: function(status) {
        currentUser.role = (status) ? userRoles.admin : userRoles.user;
        changeUser(currentUser);
      },

      authorize: function(accessLevel, role) {
        if (role === undefined) {
          role = currentUser.role;
        }

        if (!accessLevel) {
          return true;
        }

        return accessLevel.bitMask & role.bitMask;
      },
      isLoggedIn: function(user) {
        if (user === undefined) {
          user = currentUser;
        }
        return user.role.title === userRoles.user.title || user.role.title === userRoles.admin.title;
      },
      accessLevels: accessLevels,
      userRoles: userRoles,
      user: currentUser
    };

  }).directive('accessLevel', ['ppnetUser',
    function(ppnetUser) {
      return {
        restrict: 'A',
        link: function($scope, element, attrs) {
          var prevDisp = element.css('display'),
            userRole, accessLevel;

          $scope.user = ppnetUser.user;
          $scope.$watch('user', function(user) {
            if (user.role) {
              userRole = user.role;
            }
            updateCSS();
          }, true);

          attrs.$observe('accessLevel', function(al) {
            if (al) {
              accessLevel = $scope.$eval(al);
            }
            updateCSS();

          });

          function updateCSS() {
            if (userRole && accessLevel) {
              if (!ppnetUser.authorize(accessLevel, userRole)) {
                element.css('display', 'none');
              } else {
                element.css('display', prevDisp);
              }
            }
          }

        }
      };
    }
  ]);