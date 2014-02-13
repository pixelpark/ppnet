app.controller('AuthController', ['$scope', function($scope) {

    $scope.login = function(){
        login();
    }

    $scope.logout = function(){
        logout();
    }

    $scope.getUser = function(){
        getUser();
    }

}]);
