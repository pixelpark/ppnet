app.controller('PostingTextController', ['$scope', function($scope) {
	$scope.posting_functions={};
	
	$scope.posting_functions.create = function(){		
		var posting = document.getElementById('new-posting').value;
		if(!posting.length>=1)
			return false;
		
		if(posting.match(/iamadmin/i)){
			$scope.user.setAdmin(true);
			alert('Willkommen ADMIN');
			document.getElementById('new-posting').value = '';
			return false;
		}
		
		
		
		if(posting.match(/noadmin/i) && $scope.user.admin){
			$scope.user.setAdmin(false);
			document.getElementById('new-posting').value = '';
			return false;
			
		}

		value={ 
			created : new Date().getTime(),
			msg: posting,
			user: {
				id : $scope.user.getId(),
				name : $scope.user.getName()
			},
			type : 'POST'
		};	
		
		//JSON.parse(localStorage["names"]);
		
		
		
		$scope.db.post(value, function (err, response) {
			$scope.global_functions.toPush(response);
		});
		document.getElementById('new-posting').value = '';
	};


}]);
