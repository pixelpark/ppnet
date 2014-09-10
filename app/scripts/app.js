'use strict';

angular.module('ppnetApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
  'angular-gestures',
  'fx.animations',
  'angularMoment',
  'ppSync',
  'ngCordova'
])
  .config(function($routeProvider) {
    var access = routingConfig.accessLevels;
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
      .when('/hashtag', {
        templateUrl: 'views/hashtag.html',
        access: access.user
      })
      .when('/hashtag/:hashtag', {
        controller: 'HashtagController',
        templateUrl: 'views/hashtag.html',
        access: access.user
      })
      .when('/report', {
        controller: 'ReportController',
        templateUrl: 'views/report.html',
        access: access.admin
      })
      .when('/timeline', {
        controller: 'TimelineController',
        templateUrl: 'views/timeline.html',
        access: access.user
      })
      .when('/map', {
        controller: 'MapController',
        templateUrl: 'views/map.html',
        access: access.user
      })
      .when('/map/:long/:lat/:zoom', {
        controller: 'MapController',
        templateUrl: 'views/map.html',
        access: access.user
      })
      .when('/user/:id', {
        controller: 'UserController',
        templateUrl: 'views/user.html',
        access: access.user
      })
      .when('/load', {
        controller: 'LoadController',
        templateUrl: 'views/load.html',
        access: access.anon
      })
      .when('/codecatch', {
        templateUrl: 'views/codecatch.html',
        controller: 'CodecatchCtrl',
        access: access.user
      })
      .when('/helloworld', {
        templateUrl: 'views/helloworld.html',
        controller: 'HelloworldCtrl',
        access: access.user
      })
      .otherwise({
        controller: 'StreamController',
        templateUrl: 'views/stream.html',
        access: access.user
      });
  })
  .run(function($rootScope, $http, ppnetUser, ppnetGeolocation, ppnetConfig, global_functions, $location) {
    /* global $ */

    // Detect if application is running on phonegap
    $rootScope.phonegap = false;
    if (window.location.protocol === 'file:') {
      $rootScope.phonegap = true;
    }

    // Start Geolocation Watcher
    $(document).ready(function() {
      if (!global_functions.isPhoneGap()) {
        ppnetGeolocation.startGeoWatch();
      } else {
        onDeviceReady();
      }
    });

    function onDeviceReady() {
      document.addEventListener('deviceready', function() {
        ppnetGeolocation.startGeoWatch();

        if (global_functions.isIOS()) {
          $('body').addClass('phonegap-ios-7');
        }
      }, false);
    }


    $rootScope.$on("$routeChangeStart", function(event, next, current) {
      if (!ppnetUser.authorize(next.access)) {
        if (ppnetUser.isLoggedIn()) $location.path('/');
        else $location.path('/login');
      }
    });
    if (!ppnetConfig.existingConfig()) {
      ppnetConfig.loadConfigFromExternal().then(function(response) {
        ppnetConfig.init(response.data);
      });
    } else {
      ppnetConfig.init(null).then(function(response) {});
    }
  });