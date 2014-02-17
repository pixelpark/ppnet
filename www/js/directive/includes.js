app.directive('ppnetMenu', function() {
	return {
    	restrict: 'E',
       	templateUrl: 'html/includes/menu.html'
	};
});

app.directive('ppnetMenuMobile', function() {
	return {
    	restrict: 'E',
       	templateUrl: 'html/includes/menu_mobile.html'
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