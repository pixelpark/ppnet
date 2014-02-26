app.controller('PostingVideoController', ['$scope','$rootScope', function($scope,$rootScope) {
	$scope.video_functions={};
	$rootScope.videos={};
	
	$scope.video_functions.videoTakeMobile = function(element, $scope) {
		navigator.device.capture.captureVideo(captureSuccess, captureError, {limit:1, duration:7});
	};
	function captureError(error) {
		console.log(error);
	};
	
	
	
	function captureSuccess(mediaFiles) {
		console.log(mediaFiles);
		var reader = new FileReader();
		reader.onload = function(e) {
			console.log('a');
			//videoData=e.target.result;
			//console.log(videoData, mediaFiles[i]);
			//upload(videoData, type,false);
		};
		console.log(mediaFiles[0].fullPath.replace('file:',''));
		reader.readAsDataURL(mediaFiles[0].fullPath.replace('file:',''));
	};
	
	
	
	
	$scope.video_functions.videoSelectDesktop = function(element, $scope) {
		var video = element.files[0];
		var reader = new FileReader();
		reader.onload  = function(e) {
			videoData=e.target.result;		
			upload(videoData, video);
		};
		reader.readAsDataURL(video);
	};
	
	
	function upload(videoData, photofile) {
		console.log(photofile);

				    value={ 
						created : new Date().getTime(),
						msg: '',
						user: {
							id : $scope.user.getId(),
							name : $scope.user.getName()
						},
						type : 'POST',
						coords: {
					longitude: $scope.coords.longitude,
					latitude: $scope.coords.latitude,
					accuracy: $scope.coords.accuracy,
				},
						video : true
					};	
					console.log(value);
					$scope.db.post(value, function (err, response) {	
						console.log(err || response);
						$scope.global_functions.toPush(response);
						
						
						//vid='data:'+type+';base64,'+videoData;
						//$scope.videos[response.id]=new Array();
						//$scope.videos[response.id].push(vid);
						//data:video/mp4;base64,
						videoData=videoData.replace(/^data:video\/(mp4);base64,/, "");
						$scope.db.putAttachment(response.id, photofile.name, response.rev, videoData, photofile.type, function(err, res) {
							console.log(err || res);
							$scope.global_functions.toPush(res);
						});
					});
	};	
	/*
	$scope.video_functions.videoSelectDesktop = function(element, $scope) {
		var photofile = element.files[0];
		var reader = new FileReader();
		reader.onload = function(e) {
			video=e.target.result;
			if(video.match(/video\/jpeg+/)){var type='video/jpeg';} 
			if(video.match(/video\/jpg+/)){var type='video/jpg';} 
			if(video.match(/video\/png+/)){var type='video/png';} 
			
			videoSelectDesktop(video.replace(/^data:video\/(png|jpg|jpeg);base64,/, ""), type);
		};
		reader.readAsDataURL(photofile);
	}; 
	
	
	function videoSelectDesktop(video, type){
		$scope.video_functions.onSuccess(video, type, false);
	}

	
	$scope.video_functions.videoTakeMobile = function(){
		 if ($scope.phonegap) {
		 	source=navigator.camera.PictureSourceType.CAMERA;
			$scope.video_functions.video(source);
		}
	};
	$scope.video_functions.videoSelectMobile = function(){
		if ($scope.phonegap) {
			 source=navigator.camera.PictureSourceType.PHOTOLIBRARY;
			 $scope.video_functions.video(source);
		}
	};
	$scope.video_functions.video = function(source){
		navigator.camera.getPicture($scope.video_functions.onSuccess, $scope.video_functions.onFail, { 
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
	$scope.video_functions.onSuccess = function(videoData, type, phonegap) {
					phonegap = typeof phonegap !== 'undefined' ? phonegap : true;
					if(phonegap)
						var type='video/jpeg';
				    value={ 
						created : new Date().getTime(),
						msg: '',
						user: {
							id : $scope.user.getId(),
							name : $scope.user.getName()
						},
						type : 'POST',
						video : true
					};	
					$scope.db.post(value, function (err, response) {	
						$scope.global_functions.toPush(response);
						img='data:'+type+';base64,'+videoData;
						$scope.videos[response.id]=new Array();
						$scope.videos[response.id].push(img);
						$scope.db.putAttachment(response.id, 'video', response.rev, videoData, type, function(err, res) {
							$scope.global_functions.toPush(res);
						});
					});
	};	
	$scope.video_functions.onFail = function(message) {};
	*/
}]);
