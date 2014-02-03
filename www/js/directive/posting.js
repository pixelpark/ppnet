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
		templateUrl: 'html/includes/post_comments.html'
	};
});


app.directive('ppnetPostingImage', function(){
	return {
		restrict: 'AE',
		template: ' ',
		scope: {
			posting: '=posting',
			couch: '=couch',
			db: '=db',
			images: '=images',
			cache:'=cache'
		},
		link: function(scope, element, attrs) {
			if(scope.posting.doc._attachments){
				
				console.log(scope.cache);
				if (scope.cache) {
					var img = scope.couch + '/' + scope.posting.id + '/image';
					ImgCache.isCached(img, function(path, success){
						 if(success){
						 	element.html('<img src="'+img+'" id="'+scope.posting.id+'"/>');
						 	var target = $('img#'+scope.posting.id);
						 	ImgCache.useCachedFile(target);
						 }else{
						 	element.html('<img src="'+img+'" id="'+scope.posting.id+'"/>');
						 	var target = $('img#'+scope.posting.id);
						 	ImgCache.cacheFile(target.attr('src'), 
						 	function(){
						 		ImgCache.useCachedFile(target);
						 	}, 
						 	function(){
						 		element.html('<img src="'+scope.posting.temp_img+'" id="'+scope.posting.id+'"/>');
						 	});
						 }
					});
				}else{
					var img = scope.couch + '/' + scope.posting.id + '/image';
					if(scope.posting.temp_img)
						element.html('<img src="'+scope.posting.temp_img+'" id="'+scope.posting.id+'"/>');
					else
						element.html('<img src="'+img+'" id="'+scope.posting.id+'"/>');
				}
			}else{
				element.remove();
			}
			
		}
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