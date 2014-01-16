function LoginController($scope){
 	$scope.db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {
					  	 console.log('LoginController');
					  }
	});
 	


}