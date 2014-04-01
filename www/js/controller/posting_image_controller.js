app.controller('PostingImageController', ['$scope', '$rootScope', 'ppSyncService', '$q',

  function($scope, $rootScope, ppSyncService, $q) {
    $scope.image_functions = {};
    $rootScope.images = {};
    $scope.q = $q;

    var reader = new FileReader();
    reader.onload = function(e) {
      image = e.target.result;
      if (image.match(/image\/jpeg+/)) {
        var type = 'image/jpeg';
      }
      if (image.match(/image\/jpg+/)) {
        var type = 'image/jpg';
      }
      if (image.match(/image\/png+/)) {
        var type = 'image/png';
      }
      $scope.image_functions.onSuccess(image.replace(/^data:image\/(png|jpg|jpeg);base64,/, ""), type, false);
    };


    $scope.image_functions.imageSelectDesktop = function(element) {
      image = new Image($scope);
      image.imageSelectDesktop(element);
      reader.readAsDataURL(image.photofile);
    };



    $scope.image_functions.imageTakeMobile = function() {
      //if ($scope.phonegap) {
      //  source = navigator.camera.PictureSourceType.CAMERA;
      ///  $scope.image_functions.image(source);
      //}
    };

    $scope.image_functions.imageSelectMobile = function() {
      //if ($scope.phonegap) {
      //  source = navigator.camera.PictureSourceType.PHOTOLIBRARY;
      //  $scope.image_functions.image(source);
      //}
    };

    $scope.image_functions.onSuccess = function(imageData, type, phonegap) {
      image = new Image($scope);

      image.onSuccess(imageData, type, phonegap);
      ppSyncService.postDocument(image.posting).then(function(response) {
        $scope.images[response] = 'data:' + type + ';base64,' + imageData;
        ppSyncService.getDocument(response).then(function(response) {
          ppSyncService.putAttachment(response._id, 'image', response._rev, image.imageData, image.imageType);
        });
      });
    }
  }
]);