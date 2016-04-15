angular.module('ppnetApp')
    .directive('accessLevel', function(ppnetUser) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
              var accessLevel = ppnetUser.accessLevels[attrs.accessLevel] || ppnetUser.accessLevels.anon;
              scope.user = ppnetUser.user;
              scope.$watch('user', function () {
                  if(!ppnetUser.authorize(accessLevel)){
                    element.css('display', 'none');
                  } else {
                    element.css('display', 'initial');
                  }
              }, true);
            }
        };
    });
    
    