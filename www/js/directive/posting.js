app.directive('ppnetPostLikes', function(){
	var countLikes = function(allLikes){
		if(Array.isArray(allLikes))
			return allLikes.length;
	};

	var isLiked = function(allLikes, user, scope){
		var result = false;
		if(Array.isArray(allLikes)){
			angular.forEach(allLikes, function(value, key){
				if((result === false) && (value.doc.user.id == user)){
					result = value;
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
					scope.is_liked = isLiked(scope.likes[scope.posting.id], scope.user.id);
				}
			);
		},
		templateUrl: 'html/includes/post_likes.html'
	};
});

app.directive('ppnetPostComments', function(){
	return {
		restrict: 'E',
		link: function(scope, element, attrs){},
		templateUrl: 'html/includes/post_comments.html'
	};
});

app.directive('ppnetPostingFormat', function() {
	
	function hashtag(text){
		text= text.replace(/#(\S*)/g,'<a href="#/hashtag/$1" class="posting_hashtag">#$1</a>');
		return text;
	}
	
	return {
		restrict: 'AE',
		link: function(scope, element, attrs) {
			scope.posting.doc.msg_formatted = scope.posting.doc.msg;
			scope.posting.doc.msg_formatted = hashtag(scope.posting.doc.msg_formatted);
		},
		scope: {
			posting: '=posting'
		},
		template: '<div class="posting_msg" ng-bind-html="posting.doc.msg_formatted"></div>'
	};
});