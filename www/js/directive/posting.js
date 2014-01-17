app.directive('formatposting', function() {
	
	function hashtag(text){
		text= text.replace(/#(\S*)/g,'<a href="main.html?page=posting&hash=$1" class="posting_hashtag">#$1</a>');
		return text;
	}
	
	return {
		restrict: 'AE',
		link: function(scope, element, attrs) {
			scope.posting.doc.msg = hashtag(scope.posting.doc.msg);
		},
		scope: {
			posting: '=formatposting'
		},
		template: '<div class="posting_msg" ng-bind-html="posting.doc.msg"></div>'
	};
});