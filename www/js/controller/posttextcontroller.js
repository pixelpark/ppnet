function PostTextController($scope){
	$scope.posting_functions={};

	$scope.posting_functions.create = function(){		
		doc={ 
			created : new Date().getTime(),
			msg: document.getElementById('new-posting').value,
			user: {
				id : $scope.user.getId(),
				name : $scope.user.getName()
			},
			type : 'POST'
		};	
		$scope.db.post(doc, function (err, response) {});
		document.getElementById('new-posting').value = '';
	};
	
	
	
	
}
