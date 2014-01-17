app.directive('formatposting', function() {
	
	function hashtag(text){
		text= text.replace(/#(\S*)/g,'<a href="main.html?page=posting&hash=$1" class="posting_hashtag">#$1</a>');
		return text;
	}

	function time(timestamp) {
		var timestamp=timestamp/1000;
		return  Math.round(timestamp);
	};
	
	return {
		restrict: 'AE',
		link: function(scope, element, attrs) {
			scope.posting.doc.msg = hashtag(scope.posting.doc.msg);
			scope.posting.doc.created_format = time(scope.posting.doc.created);
		},
		scope: {
			posting: '=formatposting'
		},
		templateUrl: 'html/templates/template_posting.html'
	};
});