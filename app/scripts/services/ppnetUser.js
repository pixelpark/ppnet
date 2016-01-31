'use strict';

angular.module('ppnetApp')
    .factory('ppnetUser', function ($location, $q, PermissionStore, $state) {
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

        if (!localStorage.getItem('ppnetUser')) {
            currentUser = userAttributes;
        } else {
            currentUser = JSON.parse(localStorage.getItem('ppnetUser'));
        }

        function changeUser(user) {
            angular.extend(currentUser, user);
            localStorage.setItem('ppnetUser', JSON.stringify(user));
        }

        function logout() {
            var online = function (session) {
                var currentTime = (new Date()).getTime() / 1000;
                return session && session.access_token && session.expires > currentTime;
            };

            userAttributes = {
                id: '',
                name: '',
                provider: '',
                admin: false,
                online: false,
                role: userRoles.public
            };


            switch (currentUser.provider) {
                case 'facebook':
                    if (online(hello('facebook').getAuthResponse())) {
                        hello('facebook').logout().then(function () {
                            changeUser(userAttributes);
                            $state.go('login');
                        });
                    }else{
                        changeUser(userAttributes);
                        $state.go('login');
                    }
                    break;
                case 'fiware':
                    if (online(hello('fiware').getAuthResponse())) {
                        hello('fiware').logout().then(function () {
                            changeUser(userAttributes);
                            $state.go('login');
                        });
                    }else{
                        changeUser(userAttributes);
                        $state.go('login');
                    }
                    break;
                default:
                    changeUser(userAttributes);
                    $state.go('login');
            }
        }

        return {
            login: function (newUserData) {
                var user = {
                    id: newUserData.id,
                    name: newUserData.name,
                    provider: newUserData.provider,
                    online: true,
                    role: userRoles.user
                };
                changeUser(user);
                //$location.path('/'); // --> not part of user --> put this somewhere else
                return true;
            },
            logout: function () {
                logout();
            },
            toggleAdmin: function (status) {
                currentUser.role = (status) ? userRoles.admin : userRoles.user;
                changeUser(currentUser);
            },
            authorize: function (accessLevel, role) {
                if (role === undefined) {
                    role = currentUser.role;
                }

                if (!accessLevel) {
                    return true;
                }
                return accessLevel.bitMask & role.bitMask;
            },
            isLoggedIn: function (user) {
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
    function (ppnetUser) {
        return {
            restrict: 'A',
            link: function ($scope, element, attrs) {
                var prevDisp = element.css('display'),
                    userRole, accessLevel;

                $scope.user = ppnetUser.user;
                $scope.$watch('user', function (user) {
                    if (user.role) {
                        userRole = user.role;
                    }
                    updateCSS();
                }, true);

                attrs.$observe('accessLevel', function (al) {
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