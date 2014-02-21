app.controller('AuthController', ['$scope', function($scope) {

    $scope.login = function(){
        login($scope.phonegap);
    }

    $scope.logout = function(){
        logout($scope.phonegap);
    }

}]);
