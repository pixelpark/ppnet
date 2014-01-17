function AppActionController($scope){
	// Defines which action is currently active
	$scope.current_action = false;
	
	// Toggles the AppActions
	$scope.toggleAction = function(target){
		if($scope.current_action == target) {
			$scope.current_action = false;
		}
		else {
			$scope.current_action = target;	
		}
	};
	
	// Prints out the 'active' class for the corresponding <li>-Tag
	$scope.activeClass = function(target){
		return target == $scope.current_action ? 'active' : undefined;
	};
}
