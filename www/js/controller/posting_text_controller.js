app.controller('PostingTextController', ['$scope', function($scope) {
	$scope.posting_functions={};
	
	$scope.posting_functions.create = function(){		
		var posting = document.getElementById('new-posting').value;
		if(!posting.length>=1)
			return false;
		doc={ 
			created : new Date().getTime(),
			msg: posting,
			user: {
				id : $scope.user.getId(),
				name : $scope.user.getName()
			},
			type : 'POST'
		};	
		$scope.db.post(doc, function (err, response) {});
		document.getElementById('new-posting').value = '';
	};


}]);
