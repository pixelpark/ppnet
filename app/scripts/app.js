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
  'ngCordova'
])
  .config(function($routeProvider) {
    /* global routingConfig */
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
      })*/
      .when('/:id?', {
        controller: 'StreamController',
        templateUrl: 'views/stream.html',
        access: access.user
      })
      .otherwise({
        redirectTo: '/',
        access: access.public
      });
  })
  .run(function($rootScope, ppnetUser, ppnetGeolocation, ppnetConfig, global_functions, $location, ppnetID) {
    /* global $ */

    // Detect if application is running on phonegap
    $rootScope.phonegap = false;
    if (window.location.protocol === 'file:') {
      $rootScope.phonegap = true;
    }

    function onDeviceReady() {
      document.addEventListener('deviceready', function() {
        ppnetGeolocation.startGeoWatch();
        if (global_functions.isIOS()) {
          $('body').addClass('phonegap-ios-7');
        }
      }, false);
    }

    // Start Geolocation Watcher
    $(document).ready(function() {
      if (!global_functions.isPhoneGap()) {
        ppnetGeolocation.startGeoWatch();
      } else {
        onDeviceReady();
      }
    });

    $rootScope.$on('$routeChangeStart', function(event, next) {
      /*jshint unused:false */
      if (!ppnetUser.authorize(next.access)) {
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
      footer.textContent = config.name + ' - Version ' + config.version;
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