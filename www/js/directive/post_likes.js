app.directive('ppnetPostLikes', function(){
	var countLikes = function(allLikes){
		if(Array.isArray(allLikes))
			return allLikes.length;
	};

	var isNotLiked = function(allLikes, user){
		var result = true;
		if(Array.isArray(allLikes)){
			angular.forEach(allLikes, function(value, key){
				if(result && (value.doc.user.id == user)){
					result = false;
				}
			});
		}
		return result;
	};

	return {
		restrict: 'E',
		link: function(scope, element, attrs){
			scope.$watch(
				function(){
					return countLikes(scope.likes[scope.posting.id]);
				}, 
				function(){
					scope.counted_likes = countLikes(scope.likes[scope.posting.id]);
					scope.is_not_liked = isNotLiked(scope.likes[scope.posting.id], scope.user.id);
				}
			);
		},
		templateUrl: 'html/includes/post_likes.html'
	};
});