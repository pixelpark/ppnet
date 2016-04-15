'use strict';

angular.module('ppnetApp', [
        'ngCookies',
        'ngResource',
        'ngSanitize',
        'ngAnimate',
        'fx.animations',
        'angularMoment',
        'ppSync',
        'ngCordova',
        'ui.router'
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
                url: "/map",
                templateUrl: 'views/map.html',
                controller: 'MapController',
                access: access.user
            })
            .state('map.search', {
                url: "/{long}/{lat}/{zoom}",
                access: access.user
            })
            .state('user', {
                url: "/user/{id}",
                templateUrl: 'views/user.html',
                controller: 'UserController',
                access: access.user

            })
            .state('search', {
                url: "/search?val",
                templateUrl: 'views/search.html',
                controller: 'SearchController',
                access: access.user

            })
            .state('post', {
                url: "/post/{id}",
                templateUrl: 'views/singlePost.html',
                controller: 'SinglePostController',
                access: access.user

            });
    })
    .run(function ($rootScope, ppnetUser, ppnetGeolocation, ppnetConfig, global_functions, $location, ppnetID, $state/*, $state, PermissionStore*/) {
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


        $rootScope.$on('$stateChangeStart', function(e, toState) {
            /*jshint unused:false */
            if (!ppnetUser.authorize(toState.access)) {
                if (ppnetUser.isLoggedIn()) {
                    $location.path('/');
                } else {
                    $location.path('/login');
                }
            }
        });

        //ppnetID.init('123abc');

        ppnetConfig.init().then(function (config) {
            var name = config.name;
            var version = config.version;
            var footer = document.getElementById('footer');
            footer.textContent = name + ' - Version ' + version;
            
            document.getElementById('logo').textContent = name;
            document.getElementsByName('title').textContent = name + '@' + document.URL;
        });
    });