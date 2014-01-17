app.directive('formatposting', function() {
	
	function hashtag(text){
		text= text.replace(/#(\S*)/g,'<a href="main.html?page=posting&hash=$1" class="posting_hashtag">#$1</a>');
		return text;
	}

	
	return {
		restrict: 'AE',
		link: function(scope, element, attrs) {
			scope.posting.doc.msg=hashtag(scope.posting.doc.msg);
		},
		scope: {
			posting: '=formatposting'
		},
		templateUrl: 'html/templates/template_posting.html'
	};
});