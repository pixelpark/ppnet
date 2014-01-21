app.controller('LoginController', ['$scope', function($scope) {
	$scope.db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {
					  	 console.log('LoginController');
					  }
	});
 	$scope.user = {};
 	$scope.user_functions = {};
 	
	$scope.user_functions.login = function(){
		//$user.login($scope.user);
	};
	
	
}]);