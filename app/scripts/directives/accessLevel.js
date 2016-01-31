angular.module('ppnetApp')
    .directive('accessLevel', function($rootScope, ppnetUser) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var prevDisp = element.css('display');
                $rootScope.$watch('ppnetUser.user.role', function(role) {
                    if(!ppnetUser.authorize(attrs.accessLevel))
                        element.css('display', 'none');
                    else
                        element.css('display', prevDisp);
                });
            }
        };
    });