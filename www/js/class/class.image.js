var scope, rootScope;

function Image($scope, doc) {
  console.log('Image');
  scope = $scope;
  if (typeof doc != 'undefined') {
    this.id = doc.id;
    this._id = doc.id;
    this._rev = doc.doc._rev;
  }
  return this;
}

/*
  IMAGE FUNCTIONS
 */
Image.prototype.imageSelectDesktop = function(element) {
  console.log('Image.prototype.imageSelectDesktop');
  this.photofile = element.files[0];
  return this;
};

Image.prototype.imageTakeMobile = function() {
  console.log('Image.prototype.imageTakeMobile');
  if (scope.phonegap) {
    source = navigator.camera.PictureSourceType.CAMERA;
    this.prepareImage(source);
  }
};
Image.prototype.imageSelectMobile = function() {
  console.log('Image.prototype.imageSelectMobile');
  if (scope.phonegap) {
    source = navigator.camera.PictureSourceType.PHOTOLIBRARY;
    this.prepareImage(source);
  }
};

Image.prototype.prepareImage = function(source) {
  console.log('Image.prototype.image');
  navigator.camera.getPicture(this.onSuccess, this.onFail, {
    quality: 75,
    destinationType: navigator.camera.DestinationType.DATA_URL,
    sourceType: source,
    allowEdit: true,
    encodingType: Camera.EncodingType.JPEG,
    targetWidth: 640,
    targetHeight: 480,
    popoverOptions: CameraPopoverOptions,
    saveToPhotoAlbum: false,
    correctOrientation: true
  });
};

Image.prototype.onSuccess = function(imageData, type, phonegap) {
  console.log('Image.prototype.onSuccess');
  phonegap = typeof phonegap !== 'undefined' ? phonegap : true;
  if (phonegap)
    var type = 'image/jpeg';
  value = {
    created: new Date().getTime(),
    msg: '',
    user: {
      id: scope.user.getId(),
      name: scope.user.getName()
    },
    type: 'POST',
    coords: {
      longitude: scope.coords.longitude,
      latitude: scope.coords.latitude,
      accuracy: scope.coords.accuracy,
    },
    image: true
  };
  this.imageType = type,
  this.imageData = imageData;
  this.posting = value;
  return this;

};
Image.prototype.onFail = function(message) {
  console.log('Image.prototype.onFail');
};

Image.prototype.delete = function() {
  console.log('Image.prototype.delete');
  this.deleteFromScope();
  return this;
};