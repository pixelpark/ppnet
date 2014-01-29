app.controller('PostingImageController', ['$scope', function($scope) {
	$scope.image_functions={};
	
	$scope.image_functions.imageTake = function(){
		 if ($scope.phonegap) {
		 	source=navigator.camera.PictureSourceType.CAMERA;
			$scope.image_functions.image(source);
		}
	};
	$scope.image_functions.imageSelect = function(){
		if ($scope.phonegap) {
			 source=navigator.camera.PictureSourceType.PHOTOLIBRARY;
			 $scope.image_functions.image(source);
		}
	};
	$scope.image_functions.image = function(source){
		navigator.camera.getPicture($scope.image_functions.onSuccess, $scope.image_functions.onFail, { 
				quality : 75,
			    destinationType : navigator.camera.DestinationType.DATA_URL,
			    sourceType : source,
			    allowEdit : true,
			    encodingType: Camera.EncodingType.JPEG,
			    targetWidth: 640,
			    targetHeight: 480,
			    popoverOptions: CameraPopoverOptions,
			    saveToPhotoAlbum: false,
			    correctOrientation :true
		 });
	};
	$scope.image_functions.onSuccess = function(imageData) {
				    var image = "data:image/jpeg;base64," + imageData;
				    value={ 
						created : new Date().getTime(),
						msg: '<img src="'+image+'" alt="Bild von '+$scope.user.getName()+'" />',
						user: {
							id : $scope.user.getId(),
							name : $scope.user.getName()
						},
						type : 'POST'
					};	
					$scope.db.post(value, function (err, response) {});
				    
	};	
	$scope.image_functions.onFail = function(message) {};
}]);
