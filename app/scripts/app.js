'use strict';

angular.module('PPnet', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
  'angular-gestures',
  'fx.animations',
  'angularMoment',
  'ppSync'
])
  .config(function($routeProvider) {
    // Route definitions
    $routeProvider
      .when('/login', {
        controller: 'LoginController',
        templateUrl: 'views/login.html'
      })
      .when('/logout', {
        controller: 'LogoutController',
        template: 'Logout...'
      })
      .when('/post/:id', {
        controller: 'SinglePostController',
        templateUrl: 'views/singlePost.html'
      })
      .when('/hashtag', {
        templateUrl: 'views/hashtag.html'
      })
      .when('/hashtag/:hashtag', {
        controller: 'HashtagController',
        templateUrl: 'views/hashtag.html'
      })
      .when('/report', {
        controller: 'ReportController',
        templateUrl: 'views/report.html'
      })
      .when('/timeline', {
        controller: 'TimelineController',
        templateUrl: 'views/timeline.html'
      })
      .when('/map', {
        controller: 'MapController',
        templateUrl: 'views/map.html'
      })
      .when('/map/:long/:lat/:zoom', {
        controller: 'MapController',
        templateUrl: 'views/map.html'
      })
      .when('/user/:id', {
        controller: 'UserController',
        templateUrl: 'views/user.html'
      })
      .otherwise({
        controller: 'StreamController',
        templateUrl: 'views/stream.html'
      });
  })
  .run(function($rootScope, ppnetUser, ppnetGeolocation) {
    // Detect if application is running on phonegap
    $rootScope.phonegap = false;
    if (window.location.protocol === 'file:') {
      $rootScope.phonegap = true;
    }

    // Start Geolocation Watcher





    $(document).ready(function() {
      onDeviceReady()
    });


    function onDeviceReady() {
      ppnetGeolocation.startGeoWatch();
    }


    // Check if user is loged in
    if (!ppnetUser.isLogedIn()) {
      // and redirect to login view if not
      window.location = '#/login';
    }
  });