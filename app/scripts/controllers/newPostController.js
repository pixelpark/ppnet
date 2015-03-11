'use strict';

angular.module('ppnetApp')
  .controller('NewPostController', function($scope, $rootScope, ppSyncService, ppnetUser, ppnetPostHelper, global_functions) {
    /* global Camera */
    // Current User
    $scope.user = ppnetUser.user;

    // Initial Model
    $scope.newPost = {
      content: false
    };

    // Admin Toggle Function
    var toggleAdmin = function(msg) {
      if (msg.match(/iamadmin/i)) {
        ppnetUser.toggleAdmin(true);
        window.alert('Welcome Admin!');
        return true;
      }
      if (msg.match(/noadmin/i) && ppnetUser.user.role.title === 'admin') {
        ppnetUser.toggleAdmin(false);
        return true;
      }
    };

    // Check Support for FILE Api
    var reader = false;
    $scope.support = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      // Set support to true and show the file upload interface in the View
      $scope.support = true;

      // Instantiate a FileReader to get the Image Content
      reader = new FileReader();

      // Load the canvas element for resizing the image
      var canvas = document.getElementById('preview-canvas');
      var context = canvas.getContext('2d');

      // Make a new Image Object
      var image = new Image();

      // The reader onload method is called when the FileReader gets an result
      reader.onload = function(e) {
        image.src = e.currentTarget.result;

        $scope.$apply(function() {
          $scope.preview = e.currentTarget.result;
        });
      };

      // The image onload function resizes and draws the image on the canvas
      image.onload = function() {
        var maxWidth = 800;
        var maxHeight = 600;
        var width = image.width;
        var height = image.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        // Resize the canvas with the new image size
        canvas.width = width;
        canvas.height = height;

        // Draw the image
        context.drawImage(image, 0, 0, width, height);

        // Get the image DataURL
        $scope.croppedImage = canvas.toDataURL('image/jpeg', 0.8);
      };

    }

    // Phonegap Capture Image

    var captureSuccess = function(result) {
      result = 'data:image/jpeg;base64,' + result;
      image.src = result;

      $scope.$apply(function() {
        $scope.preview = result;
        $scope.showMediaSelect = false;
      });
    };

    var captureError = function(error) {
      console.log('Capture Error ' + error.code);
    };

    $scope.captureImage = function(captureType) {
      var options = {
        quality: 90,
        destinationType: Camera.DestinationType.DATA_URL,
        encodingType: Camera.EncodingType.JPEG,
        saveToPhotoAlbum: true,
        targetWidth: 800,
        targetHeight: 600,
        sourceType: Camera.PictureSourceType.CAMERA
      };

      if (captureType === 1) {
        options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
      }

      navigator.camera.getPicture(captureSuccess, captureError, options);
    };

    $scope.showUpload = function() {
      if (global_functions.isPhoneGap()) {
        return false;
      } else {
        return true;
      }
    };

    // Function get called when file input changes
    $scope.processImage = function(image) {
      var file = image.files[0];
      reader.readAsDataURL(file);
    };

    $scope.newPost = function() {
      var msg = $scope.newPost.content;
      if ((typeof msg !== 'undefined' && msg.length > 0 && !toggleAdmin(msg)) || $scope.croppedImage) {
        var postObject;
        if ($scope.croppedImage) {
          postObject = ppnetPostHelper.createImageObject(
            msg,
            ppnetUser.user
          );
        } else {
          postObject = ppnetPostHelper.createPostObject(
            msg,
            ppnetUser.user
          );
        }

        // Save the object to the database
        ppSyncService.postDocument(postObject).then(function(response) {
          // Is there a image to upload?
          if ($scope.croppedImage && response.ok) {

            // Extract the Base64 encoded String from DataURL
            var regex = /^data:.+\/(.+);base64,(.*)$/;
            var matches = $scope.croppedImage.match(regex);

            // Attach the attachment to the Post
            ppSyncService.putAttachment(response.id, 'image', response.rev, matches[2], 'image/jpeg');
          }

          // Reset the Input Fields
          $scope.croppedImage = false;
          $scope.preview = false;
        });
      }
      $scope.newPost.content = '';
    };
  });