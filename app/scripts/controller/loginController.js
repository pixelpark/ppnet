'use strict';

angular.module('PPnet')
    .controller('LoginController', function($scope, $location, $routeParams, ppnetUser) {

        var isCordovaApp = $scope.isCordovaApp = !!window.cordova;



        // Login a user with random credentials. Only for Debugging.
        $scope.login = function() {
            var newUser = {
                id: Math.ceil(Math.random() * 10000).toString(),
                name: 'User' + Math.ceil(Math.random() * 10000),
                provider: 'local'
            };
            ppnetUser.logout();
            if (ppnetUser.login(newUser)) {
                $location.path('');
            }
        };

        $scope.enableSimpleLogin = true;
        $scope.simpleLogin = function() {
            var newUser = {
                id: $scope.simple.id.toString(),
                name: $scope.simple.name,
                provider: 'simple'
            };
            ppnetUser.logout();
            if (ppnetUser.login(newUser)) {
                $location.path('');
            }
        };

        // Logs the User out if second url parameter is 'logout'
        if ($routeParams.task === 'logout') {
            hello().logout();
            ppnetUser.logout();
            $location.path('login');
        }


        var redirect_uri = (isCordovaApp) ? 'http://www.tobias-rotter.de/ppnet/redirect.html' : 'index.html';
        var fiware = '320';
        var facebook = '758204300873538';
        var google = '971631219298-dgql1k3ia1qpkma6lfsrnt2cjevvg9fm.apps.googleusercontent.com';
        var github = 'c6f5cd8c081419b33623';
        var windows = '0000000048117AB3';

        if (isCordovaApp) {
            hello_phonegap.init({
                facebook: facebook,
                fiware: fiware,
                google: google,
                github: github,
                windows: windows
            }, {
                redirect_uri: redirect_uri
            });
            hello_phonegap.on('auth.login', function(auth) {
                // call user information, for the given network
                hello_phonegap(auth.network).api('/me').success(function(r) {

                    var userdata = {
                        id: auth.network + '_' + r.id,
                        name: r.name,
                        provider: auth.network
                    };
                    ppnetUser.login(userdata);
                });
            });
        } else {
            hello.init({
                facebook: facebook,
                fiware: fiware,
                google: google,
                github: github,
                windows: windows
            }, {
                redirect_uri: redirect_uri
            });
            hello.on('auth.login', function(auth) {
                // call user information, for the given network
                hello(auth.network).api('/me').success(function(r) {

                    var userdata = {
                        id: auth.network + '_' + r.id,
                        name: r.name,
                        provider: auth.network
                    };
                    ppnetUser.login(userdata);
                });
            });
        }



    });