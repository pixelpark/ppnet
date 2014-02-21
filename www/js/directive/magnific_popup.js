app.directive('magnificPopup', function(){
	return {
		restrict: 'E',
		link: function(scope, element, attrs){
			console.log('POPUP:');
			console.log(scope);
			//element.magnificPopup({type:'image'});
		}
	};
});