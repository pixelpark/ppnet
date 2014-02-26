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
			if(scope.posting.doc._attachments && scope.posting.doc.image){
				if (scope.cache){
					var img = scope.couch + '/' + scope.posting.id + '/image';
					
					ImgCache.isCached(img, function(path, success){
						 if(success){
						 	element.html('<a href="'+img+'" class="magnific-popup"><img src="'+img+'" id="'+scope.posting.id+'"/></a>');
						 	var target = $('img#'+scope.posting.id);
						 	ImgCache.useCachedFile(target);
						 }else{
						 	element.html('<a href="'+img+'" class="magnific-popup"><img src="'+img+'" id="'+scope.posting.id+'"/></a>');
						 	var target = $('img#'+scope.posting.id);
						 	ImgCache.cacheFile(target.attr('src'), 
						 		function(){
						 			ImgCache.useCachedFile(target);
						 		}, 
						 		function(){
						 			if(scope.posting.temp_img)
						 			element.html('<a href="'+scope.posting.temp_img+'" class="magnific-popup"><img src="'+scope.posting.temp_img+'" id="'+scope.posting.id+'"/></a>');
						 		//else
						 			
						 	});
						 }
					});
				}else{
					var img = scope.couch + '/' + scope.posting.id + '/image';
					if(scope.posting.temp_img)
						element.html('<a href="'+scope.posting.temp_img+'" class="magnific-popup"><img src="'+scope.posting.temp_img+'" id="'+scope.posting.id+'"/></a>');
					else
						element.html('<a href="'+img+'" class="magnific-popup"><img src="'+img+'" id="'+scope.posting.id+'"/></a>');
				}
			}else{
				element.remove();
			}
			setTimeout(function(){
				console.log('MAGNIFIC D');
				$('a.magnific-popup').magnificPopup({
					type:'image',
					closeOnContentClick: true,
					closeBtnInside: true
				});
			}, 1);
		}
	};
});


app.directive('ppnetPostingFormat', function() {
	function linkify(inputText) {
	    var replacedText, replacePattern1, replacePattern2, replacePattern3;
	
	    //URLs starting with http://, https://, or ftp://
	    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
	    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');
	
	    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
	    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
	    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');
	
	    //Change email addresses to mailto:: links.
	    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
	    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
	
	    return replacedText;
	}
	
	function hashtag(text, scope){
		return text.replace(/(^|\s)(#[a-zA-ZöüäÖÜÄß\-\d-]+)/gi, function(t) {
			return ' '+t.link("#/hashtag/"+t.replace("#","").trim()).trim();
		});
	}
	
	
	return {
		restrict: 'AE',
		link: function(scope, element, attrs) {
			scope.posting.doc.msg_formatted = scope.posting.doc.msg;
			
			scope.posting.doc.msg_formatted = hashtag(scope.posting.doc.msg_formatted, scope);
			scope.posting.doc.msg_formatted = linkify(scope.posting.doc.msg_formatted);
		},
		scope: {
			posting: '=posting'
		},
		template: '<div class="posting_msg" ng-bind-html="posting.doc.msg_formatted"></div>'
	};
});

app.directive('ppnetPostingVideo', function(){
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
			if(scope.posting.doc._attachments && scope.posting.doc.video){
				angular.forEach(scope.posting.doc._attachments, function(row, key){
					element.html('<video width="320" height="240" controls>'
							+'<source src="'+scope.couch + '/' + scope.posting.id + '/'+key+'" type="'+row.content_type+'">'
							+'Your browser does not support the video tag.'
							+'</video>');
				});
				
			}
		}
	};
});