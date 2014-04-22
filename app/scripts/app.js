'use strict';

angular.module('PPnet', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'ngAnimate',
  'ppSync'

])
  .config(function($routeProvider) {
    // Route definitions
    $routeProvider
      .when('/login', {
        controller: 'UserController',
        templateUrl: 'views/login.html'
      })
      .when('/logout', {
        controller: 'LogoutController',
        template: 'Logout...'
      })
      .when('/user/:task', {
        controller: 'UserController',
        template: ''
      })
      .when('/stream', {
        controller: 'StreamController',
        templateUrl: 'views/stream.html'
      })
      .when('/posting', {
        controller: 'PostingController',
        templateUrl: 'views/posting.html'
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
      .when('/view/timeline', {
        controller: 'TimelineController',
        templateUrl: 'views/timeline.html'
      })
      .when('/view/map/:long/:lat/:zoom', {
        controller: 'MapController',
        templateUrl: 'views/map.html'
      })
      .otherwise({
        controller: 'PostingController',
        templateUrl: 'views/posting.html'
      });
  })
  .run(function($rootScope, ppnetUser) {
    //Initialize the ImageCache Plugin
    $rootScope.cache = false;
    ImgCache.init(function() {
      $rootScope.cache = true;
    });

    // Detect if application is running on phonegap
    $rootScope.phonegap = false;
    if (window.location.protocol === 'file:') {
      $rootScope.phonegap = true;
    }
    // Check if user is loged in
    if (!ppnetUser.isLogedIn()) {
      // and redirect to login view if not
      window.location = '#/login';
    }
  });