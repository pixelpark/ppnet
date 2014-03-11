var scope;
function Posting($scope, view, row) {
	//this.gender = gender;
	//console.log($scope);
	scope=$scope;

	switch (view) {
		case 'posting':
			this.doc = row.doc;
			this.id = (row.id) ? row.id : row.doc._id;
			$scope.types[row.id] = {
				type: 'POST'
			};
			if (!scope.likes[row.id]) {
				scope.likes[row.id] = new Array();
			}
			if (!scope.comments[row.id]) {
				scope.comments[row.id] = new Array();
			}
			break;
	}

	return this;
}

Posting.prototype.delete = function() {
	scope.db.get(this.id, function(err, results) {
		//scope.db.remove(results, function(err, results) {
			console.log(results);
			pusher = new Array();
			pusher.push(results._id);

			angular.forEach(scope.likes[results._id], function(value, key) {
				scope.like_functions.delete(value, 0);
				pusher.push(value.id);
			});
			angular.forEach(scope.comments[results._id], function(value, key) {
				scope.comment_functions.delete(value, 0);
				pusher.push(value.id);
			});
			scope.global_functions.toPush(pusher);
		//});
	});
};