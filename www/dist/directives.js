app.directive('ppnetMenu', function() {
	return {
    	restrict: 'E',
       	templateUrl: 'html/includes/menu.html'
	};
});

app.directive('ppnetHeader', function() {
	return {
    	restrict: 'E',
       	templateUrl: 'html/includes/header.html'
	};
});

app.directive('ppnetFooter', function() {
	return {
    	restrict: 'E',
       	templateUrl: 'html/includes/footer.html'
	};
});

app.directive('ppnetPostingActions', function() {
	return {
    	restrict: 'C',
       	templateUrl: 'html/includes/posting_actions.html'
	};
});
app.directive('postingformat', function() {
	
	function hashtag(text){
		text= text.replace(/#(\S*)/g,'<a href="#/hashtag/$1" class="posting_hashtag">#$1</a>');
		return text;
	}
	
	return {
		restrict: 'AE',
		link: function(scope, element, attrs) {
			scope.posting.doc.msg_formatted = scope.posting.doc.msg;
			hashtag(scope.posting.doc.msg_formatted);
		},
		scope: {
			posting: '=postingformat'
		},
		template: '<div class="posting_msg" ng-bind-html="posting.doc.msg_formatted"></div>'
	};
});