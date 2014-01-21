app.directive('ppnetMenu', function() {
	return {
    	restrict: 'E',
       	templateUrl: 'html/menu.html'
	};
});

app.directive('ppnetHeader', function() {
	return {
    	restrict: 'E',
       	templateUrl: 'html/header.html'
	};
});

app.directive('ppnetFooter', function() {
	return {
    	restrict: 'E',
       	templateUrl: 'html/footer.html'
	};
});

app.directive('appActions', function() {
	return {
    	restrict: 'E',
       	templateUrl: 'html/appActions.html'
	};
});