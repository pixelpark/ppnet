'use strict';

angular.module('ppnetApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngRoute',
        'ngAnimate',
        'fx.animations',
        'angularMoment',
        'ppSync',
        'ngCordova',
        'ui.router',
        'permission'
    ])
    .config(function ($stateProvider, $urlRouterProvider) {
        /* global routingConfig */
        $urlRouterProvider.otherwise("/");
        var access = routingConfig.accessLevels;
        $stateProvider

            .state('login', {
                url: "/login",
                templateUrl: 'views/login.html',
                controller: 'LoginController',
                access: access.anon

            })
            .state('logout', {
                url: "/logout",
                template: 'Logout...',
                controller: 'LogoutController',
                access: access.user

            })
            .state('stream', {
                url: "/",
                templateUrl: 'views/stream.html',
                controller: 'StreamController',
                access: access.user

            })
            .state('stream.search', {
                url: "/{id}",
                templateUrl: 'views/stream.html',
                controller: 'StreamController',
                access: access.user
            })
            .state('timeline', {
                url: "/timeline",
                templateUrl: 'views/timeline.html',
                controller: 'TimelineController',
                access: access.user

            })
            .state('map', {
                url: "/map/{long}/{lat}/{zoom}",
                templateUrl: 'views/map.html',
                controller: 'MapController',
                access: access.user

            })
            .state('user', {
                url: "/user/{id}",
                templateUrl: 'views/user.html',
                controller: 'UserController',
                access: access.user

            })
            .state('post', {
                url: "/post/{id}",
                templateUrl: 'views/singlePost.html',
                controller: 'SinglePostController',
                access: access.user

            })
        ;


        /*
         // Route definitions
         $routeProvider
         .when('/login', {
         controller: 'LoginController',
         templateUrl: 'views/login.html',
         access: access.anon
         })
         .when('/logout', {
         controller: 'LogoutController',
         template: 'Logout...',
         access: access.user
         })
         .when('/post/:id', {
         controller: 'SinglePostController',
         templateUrl: 'views/singlePost.html',
         access: access.user
         })
         .when('/timeline', {
         controller: 'TimelineController',
         templateUrl: 'views/timeline.html',
         access: access.user
         })
         .when('/map/:long?/:lat?/:zoom?', {
         controller: 'MapController',
         templateUrl: 'views/map.html',
         access: access.user
         })
         .when('/user/:id', {
         controller: 'UserController',
         templateUrl: 'views/user.html',
         access: access.user
         })
         /*.when('/load', {
         controller: 'LoadController',
         templateUrl: 'views/load.html',
         access: access.anon
         })* /
         .when('/:id?', {
         controller: 'StreamController',
         templateUrl: 'views/stream.html',
         access: access.user
         })
         .otherwise({
         redirectTo: '/',
         access: access.public
         });
         */


    })
    .run(function ($rootScope, ppnetUser, ppnetGeolocation, ppnetConfig, global_functions, $location, ppnetID, $state, PermissionStore) {
        /* global $ */

        // Detect if application is running on phonegap
        $rootScope.phonegap = false;
        if (window.location.protocol === 'file:') {
            $rootScope.phonegap = true;
        }

        function onDeviceReady() {
            document.addEventListener('deviceready', function () {
                ppnetGeolocation.startGeoWatch();
                if (global_functions.isIOS()) {
                    $('body').addClass('phonegap-ios-7');
                }
            }, false);
        }

        // Start Geolocation Watcher
        $(document).ready(function () {
            if (!global_functions.isPhoneGap()) {
                ppnetGeolocation.startGeoWatch();
            } else {
                onDeviceReady();
            }
        });


        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            /*jshint unused:false */
            if (!ppnetUser.authorize(toState.access)) {
                if (ppnetUser.isLoggedIn()) {
                    $location.path('/');
                } else {
                    $location.path('/login');
                }
            }
        });

        ppnetID.init('123abc'); // some sort of useless

        ppnetConfig.init().then(function (config) {
            var footer = document.getElementById('footer');
            //footer.textContent = config.name + ' - Version ' + config.version;
        });

        /*if (!ppnetConfig.existingConfig()) {
         ppnetConfig.loadConfigFromExternal().then(function(response) {
         var footer = document.getElementById('footer');
         footer.textContent = response.data.name + ' - Version ' + response.data.version;

         ppnetConfig.init(response.data);
         });
         } else {
         ppnetConfig.init();
         }*/


    });