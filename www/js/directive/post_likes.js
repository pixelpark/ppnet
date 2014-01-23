app.directive('ppnetPostLikes', function(){
	var countLikes = function(allLikes){
		if(Array.isArray(allLikes))
			return allLikes.length;
	};

	return {
		restrict: 'E',
		scope: {
			likes: '=likes'
		},
		link: function(scope, element, attrs){
			//scope.counted_likes = countLikes(scope.likes);
			scope.$watch(function(){return countLikes(scope.likes);}, function(){
				scope.counted_likes = countLikes(scope.likes);
			});
		},
		template: '<span ng-show="counted_likes">{{counted_likes}} <i class="fa fa-thumbs-up"></i></span>'
	};
});