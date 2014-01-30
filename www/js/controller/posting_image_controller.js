app.controller('PostingImageController', ['$scope', function($scope) {
	$scope.image_functions={};
	
	$scope.image_functions.imageSelectDesktop = function(element, $scope) {
		var photofile = element.files[0];
		var reader = new FileReader();
		reader.onload = function(e) {
			image=e.target.result;
			if(image.match(/image\/jpeg+/)){var type='image/jpeg';} 
			if(image.match(/image\/jpg+/)){var type='image/jpg';} 
			if(image.match(/image\/png+/)){var type='image/png';} 
			
			imageSelectDesktop(image.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""), type);
		};
		reader.readAsDataURL(photofile);
	}; 
	function imageSelectDesktop(image, type){
		$scope.image_functions.onSuccess(image, type, false);
	}

	
	$scope.image_functions.imageTakeMobile = function(){
		 if ($scope.phonegap) {
		 	source=navigator.camera.PictureSourceType.CAMERA;
			$scope.image_functions.image(source);
		}
	};
	$scope.image_functions.imageSelectMobile = function(){
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
	$scope.image_functions.onSuccess = function(imageData, type, phonegap) {
					phonegap = typeof phonegap !== 'undefined' ? phonegap : true;
					if(phonegap)
						var type='image/jpeg';
				    value={ 
						created : new Date().getTime(),
						msg: '',
						user: {
							id : $scope.user.getId(),
							name : $scope.user.getName()
						},
						type : 'POST'
					};	
					$scope.db.post(value, function (err, response) {						
						$scope.db.putAttachment(response.id, 'image', response.rev, imageData, type, function(err, res) {});
					});
	};	
	$scope.image_functions.onFail = function(message) {};
}]);
