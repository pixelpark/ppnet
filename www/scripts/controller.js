'use strict';

angular.module('PPnet')
    .controller('LoginController', function($scope, $location, $routeParams, ppnetUser) {

        var isCordovaApp = $scope.isCordovaApp = !!window.cordova;



        // Login a user with random credentials. Only for Debugging.
        $scope.login = function() {
            var newUser = {
                id: Math.ceil(Math.random() * 10000).toString(),
                name: 'User' + Math.ceil(Math.random() * 10000),
                provider: 'local'
            };
            ppnetUser.logout();
            if (ppnetUser.login(newUser)) {
                $location.path('');
            }
        };

        $scope.enableSimpleLogin = true;
        $scope.simpleLogin = function() {
            var newUser = {
                id: $scope.simple.id.toString(),
                name: $scope.simple.name,
                provider: 'simple'
            };
            ppnetUser.logout();
            if (ppnetUser.login(newUser)) {
                $location.path('');
            }
        };

        // Logs the User out if second url parameter is 'logout'
        if ($routeParams.task === 'logout') {
            hello().logout();
            ppnetUser.logout();
            $location.path('login');
        }


        var redirect_uri = (isCordovaApp) ? 'http://www.tobias-rotter.de/ppnet/redirect.html' : 'index.html';
        var fiware = '320';
        var facebook = '758204300873538';
        var google = '971631219298-dgql1k3ia1qpkma6lfsrnt2cjevvg9fm.apps.googleusercontent.com';
        var github = 'c6f5cd8c081419b33623';
        var windows = '0000000048117AB3';

        if (isCordovaApp) {
            hello_phonegap.init({
                facebook: facebook,
                fiware: fiware,
                google: google,
                github: github,
                windows: windows
            }, {
                redirect_uri: redirect_uri
            });
            hello_phonegap.on('auth.login', function(auth) {
                // call user information, for the given network
                hello_phonegap(auth.network).api('/me').success(function(r) {

                    var userdata = {
                        id: auth.network + '_' + r.id,
                        name: r.name,
                        provider: auth.network
                    };
                    ppnetUser.login(userdata);
                });
            });
        } else {
            hello.init({
                facebook: facebook,
                fiware: fiware,
                google: google,
                github: github,
                windows: windows
            }, {
                redirect_uri: redirect_uri
            });
            hello.on('auth.login', function(auth) {
                // call user information, for the given network
                hello(auth.network).api('/me').success(function(r) {

                    var userdata = {
                        id: auth.network + '_' + r.id,
                        name: r.name,
                        provider: auth.network
                    };
                    ppnetUser.login(userdata);
                });
            });
        }



    });
'use strict';

angular.module('PPnet')
    .controller('LogoutController', function($scope, $location, ppnetUser) {
        hello().logout();
        ppnetUser.logout();
        console.log('Logout');
        $location.path('login');
    });
'use strict';
angular.module('PPnet')
  .controller('StreamController', function($scope, ppSyncService, ppnetPostHelper, ppnetUser) {
    $scope.posts = [];
    $scope.comments = [];
    $scope.likes = [];

    $scope.loadingStream = true;

    $scope.toggleTimeVar = false;
    $scope.toggleTime = function() {
      $scope.toggleTimeVar = $scope.toggleTimeVar === false ? true : false;
    };

    ppSyncService.fetchChanges().then(function(response) {
      //console.log(response);
    }, function(error) {
      console.log(error);
    }, function(change) {
      if (change.deleted) {
        ppnetPostHelper.deletePost($scope.posts, change); // Deletes post from array
        ppnetPostHelper.deleteLike($scope.likes, change); // Deletes like from array
      } else {
        // Fetch the change event and assign the change to the specific array
        switch (change.doc.type) {
          case 'POST':
            ppSyncService.getInfo().then(function(response) {
              console.log(response);
            });
            $scope.posts.push(change);
            break;
          case 'LIKE':
            ppnetPostHelper.loadLike($scope.likes, change);
            break;
          case 'COMMENT':
            ppnetPostHelper.loadComment($scope.comments, change);
            break;
          case 'IMAGE':
            if (!angular.isUndefined(change.doc._attachments)) {
              $scope.posts.push(change);
            }
            break;
        }
      }
    });

    var loadMeta = function(response) {
      for (var i = response.length - 1; i >= 0; i--) {
        switch (response[i].doc.type) {
          case 'LIKE':
            ppnetPostHelper.loadLike($scope.likes, response[i]);
            break;
          case 'COMMENT':
            ppnetPostHelper.loadComment($scope.comments, response[i]);
            break;
        }
      }
    };

    // Get the next 10 posts from the database, startkey defines the offset of the request
    var loadDocuments = function(startkey) {
      if (angular.isUndefined(startkey)) {
        startkey = [9999999999999, {}, {}];
      } else {
        startkey = [startkey, {}, {}];
      }

      // Limits the number of returned documents
      var limit = 10;

      // Gets all Documents, including Posts, Images, Comments and Likes
      ppSyncService.getPosts(limit, startkey).then(function(response) {
        // Loop through the response and assign the elements to the specific temporary arrays
        for (var i = response.length - 1; i >= 0; i--) {
          // Posts and Images are pushed to the same array because,
          // they are both top parent elements
          $scope.posts.push(response[i]);

          // GET META ASSETS
          ppSyncService.getRelatedDocuments(response[i].id).then(loadMeta);
        }
        $scope.loadingStream = false;
      });
    };
    loadDocuments();


    $scope.loadMore = function() {
      $scope.loadingStream = true;
      var oldestTimestamp = 9999999999999;
      for (var i = 0; i < $scope.posts.length; i++) {

        if (oldestTimestamp > $scope.posts[i].value) {
          oldestTimestamp = $scope.posts[i].value;
        }
      }
      loadDocuments(oldestTimestamp - 1);
    };

    $scope.isPostedByUser = function(user) {
      return user.id === ppnetUser.getId() ? true : false;
    };

    $scope.deletePost = function(postId) {
      ppnetPostHelper.findPostInArray($scope.posts, postId).then(function(response) {
        var currentObject = $scope.posts[response];

        $scope.posts.splice(response, 1);
        ppSyncService.deleteDocument(currentObject.doc, true);
        return true;
      });
    };

    $scope.top = function(likes) {
      console.log(likes);
      if (likes >= 2) {
        return 'big';
      } else if (likes >= 1) {
        return 'medium';
      }
    };

    $scope.$on("$destroy", function() {
      ppSyncService.cancel();
    });
  });
'use strict';

angular.module('PPnet')
  .controller('PostActionsController', function($scope) {
    // Defines which action is currently active
    $scope.current_action = 'post_image';

    // Toggles the AppActions
    $scope.toggleAction = function(target) {
      if ($scope.current_action === target) {
        $scope.current_action = false;
      } else {
        $scope.current_action = target;
      }
    };

    // Prints out the 'active' class for the corresponding <li>-Tag
    $scope.activeClass = function(target) {
      return target === $scope.current_action ? 'active' : undefined;
    };

  });
'use strict';

angular.module('PPnet')
  .controller('PostMetaController', function($scope, ppSyncService, ppnetPostHelper, ppnetUser) {

    $scope.newLike = function(postId) {
      $scope.inProgress = true;

      var user = ppnetUser.getUserData();
      var likeObject = ppnetPostHelper.createLikeObject(user, postId);

      ppSyncService.postDocument(likeObject).then(function() {
        $scope.inProgress = false;
      });
    };

    $scope.deleteLike = function(postId) {
      $scope.inProgress = true;

      ppnetPostHelper.deleteLikeLocal($scope.likes, postId, ppnetUser.getId())
        .then(function(result) {
          ppSyncService.deleteDocument(result, true).then(function() {
            $scope.inProgress = false;
          });
        });
    };

    $scope.isLiked = function(postId) {
      var userId = ppnetUser.getId();

      if (!angular.isUndefined($scope.likes[postId])) {
        for (var i = 0; i < $scope.likes[postId].length; i++) {
          var currentObject = $scope.likes[postId][i];
          if (currentObject.doc.user.id === userId) {
            return true;
          }
        }
      }

      return false;
    };

    $scope.isCommented = function(postId) {
      var userId = ppnetUser.getId();

      if (!angular.isUndefined($scope.comments[postId])) {
        for (var i = 0; i < $scope.comments[postId].length; i++) {
          var currentObject = $scope.comments[postId][i];
          if (currentObject.doc.user.id === userId) {
            return true;
          }
        }
      }
    };

    $scope.isTrending = function(likes) {
      if (likes >= 10) {
        return 'big';
      } else if (likes >= 5) {
        return 'medium';
      }
    };
  });
'use strict';

angular.module('PPnet')
  .controller('NewPostController', function($scope, $rootScope, ppSyncService, ppnetUser, ppnetPostHelper) {

    // Current User
    $scope.user = ppnetUser.getUserData();

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
      if (msg.match(/noadmin/i) && ppnetUser.isAdmin()) {
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
      }

      if (captureType === 1) {
        options.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
      }

      navigator.camera.getPicture(captureSuccess, captureError, options);
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
            ppnetUser.getUserData()
          );
        } else {
          postObject = ppnetPostHelper.createPostObject(
            msg,
            ppnetUser.getUserData()
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
'use strict';

angular.module('PPnet')
  .controller('NewCommentController', function($scope, ppSyncService, ppnetUser, ppnetPostHelper) {

    // Creates a new Post
    $scope.newComment = function() {
      // Create the object which should be saved
      var commentObject = ppnetPostHelper.createCommentObject(
        $scope.newComment.content,
        ppnetUser.getUserData(),
        $scope.postId
      );

      // Save the object to the database
      ppSyncService.postDocument(commentObject);

      // Empty the textarea
      $scope.newComment.content = '';
    };
  });
'use strict';

angular.module('PPnet')
  .controller('AdminDebugController', function($scope, ppSyncService, ppnetUser, ppnetGeolocation) {

    $scope.isAdmin = ppnetUser.isAdmin();

    $scope.resetDatabase = function() {
      ppSyncService.reset();
    };

    $scope.getDatabaseInfo = function() {
      ppSyncService.debug().then(function(response) {
        console.log(response);
      });
    };

    $scope.debugUserData = function() {
      console.log(ppnetUser.getUserData());
      console.log(ppnetUser.isAdmin());
    };

    $scope.debugGeolocation = function() {
      console.log(ppnetGeolocation.getCurrentCoords());
    };

  });
'use strict';

angular.module('PPnet')
  .controller('SinglePostController', function($scope, $routeParams, ppSyncService, ppnetPostHelper, ppnetUser) {

    $scope.posts = [];
    $scope.comments = [];
    $scope.likes = [];

    $scope.loadingComments = true;
    $scope.loadingLikes = true;

    $scope.toggleTimeVar = false;
    $scope.toggleTime = function() {
      $scope.toggleTimeVar = $scope.toggleTimeVar === false ? true : false;
    };

    ppSyncService.fetchChanges().then(function(response) {
      //console.log(response);
    }, function(error) {
      console.log(error);
    }, function(change) {
      if (change.deleted) {
        ppnetPostHelper.deleteLike($scope.likes, change);
        ppnetPostHelper.deleteComment($scope.comments, change);
      } else {
        switch (change.doc.type) {
          case 'LIKE':
            ppnetPostHelper.loadLike($scope.likes, change);
            break;
          case 'COMMENT':
            ppnetPostHelper.loadComment($scope.comments, change);
            break;
        }
      }
    });

    $scope.isCommentedByUser = function(user) {
      return user.id === ppnetUser.getId() ? true : false;
    };

    $scope.deleteComment = function(comment) {
      ppSyncService.deleteDocument(comment.doc, true);
    };

    var loadMeta = function(response) {
      for (var i = response.length - 1; i >= 0; i--) {
        switch (response[i].doc.type) {
          case 'LIKE':
            ppnetPostHelper.loadLike($scope.likes, response[i]);
            break;
          case 'COMMENT':
            ppnetPostHelper.loadComment($scope.comments, response[i]);
            break;
        }
      }
      $scope.loadingComments = false;
      $scope.loadingLikes = false;
    };

    ppSyncService.getDocument($routeParams.id).then(function(response) {
      var tempPostObject = {
        'doc': response,
        'id': response._id
      };

      $scope.posts.push(tempPostObject);
      ppSyncService.getRelatedDocuments($routeParams.id).then(loadMeta);
    });



    $scope.$on("$destroy", function() {
      ppSyncService.cancel();
    });
  });
'use strict';

angular.module('PPnet')
  .controller('TimelineController', function($scope, ppSyncService) {

    var viewsize = window.innerHeight - 100;
    var timeline = new links.Timeline(document.getElementById('timeline'));
    timeline.draw([], {
      minHeight: 500,
      height: viewsize + 'px',
      animate: false,
      cluster: true,
      style: 'box',
      box: {
        align: 'left'
      },
      zoomMin: 1 * 60 * 1000,
      zoomMax: 2 * 7 * 24 * 60 * 60 * 1000
    });

    // Gets all Documents, including Posts, Images, Comments and Likes
    ppSyncService.getPosts().then(function(response) {
      // Loop through the response and assign the elements to the specific temporary arrays
      for (var i = response.length - 1; i >= 0; i--) {
        switch (response[i].doc.type) {
          case 'POST':
          case 'IMAGE':
            // Posts and Images are pushed to the same array because,
            // they are both top parent elements
            $scope.prepareForTimeline(response[i].doc);
            break;
        }
      }
      $scope.loadingStream = false;
    });

    ppSyncService.fetchChanges().then(function() {
      //console.log(response);
    }, function(error) {
      console.log(error);
    }, function(change) {
      if (!change.deleted) {
        switch (change.doc.type) {
          case 'POST':
            $scope.prepareForTimeline(change.doc);
            break;
          case 'IMAGE':
            if (!angular.isUndefined(change.doc._attachments)) {
              $scope.prepareForTimeline(change.doc);
            }
            break;
        }
      }
    });

    $scope.timelineZoomIn = function() {
      timeline.zoom(1);
    };
    $scope.timelineZoomOut = function() {
      timeline.zoom(-1);
    };
    $scope.centerNow = function() {
      timeline.setVisibleChartRangeNow();
    };
    $scope.prepareForTimeline = function(doc) {
      if ((!angular.isUndefined(doc.msg) && doc.msg.trim() !== '') || doc.type === 'IMAGE') {
        doc.content = '<div class="ppnet-timeline-content">' + doc.msg + '</div>';

        if (doc.type === 'IMAGE') {
          // Load the attachment from local database
          ppSyncService.getAttachment(doc._id, 'image').then(function(response) {
            var reader = new FileReader();

            reader.onload = function(e) {
              doc.content = doc.content + '<img src="' + e.target.result + '">';
              $scope.pushToTimeline(doc);
            };

            // Convert the BLOB to DataURL
            if (response)
              reader.readAsDataURL(response);
          });
        } else {
          $scope.pushToTimeline(doc);
        }
      }
    };

    $scope.pushToTimeline = function(doc) {
      timeline.addItem({
        'start': new Date(doc.created),
        'end': '', // end is optional
        'content': '<span style="color: #0195A6">' + doc.user.name + '</span>' + '<br>' + doc.content,
        'editable': false
      });
    };
    $scope.$on("$destroy", function() {
      ppSyncService.cancel();
    });
  });
'use strict';
angular.module('PPnet')
  .controller('HashtagController', function($scope, $location, $routeParams, ppSyncService, ppnetPostHelper, ppnetUser) {
    $scope.posts = [];
    $scope.comments = [];
    $scope.likes = [];

    $scope.hashtag = $scope.model_hashtag = $routeParams.hashtag;

    $scope.toggleTimeVar = false;
    $scope.toggleTime = function() {
      $scope.toggleTimeVar = $scope.toggleTimeVar === false ? true : false;
    };


    $scope.loadingStream = true;
    $scope.search = function() {
      $location.path('/hashtag/' + $scope.model_hashtag);
    };

    ppSyncService.fetchChanges().then(function(response) {
      //console.log(response);
    }, function(error) {
      console.log(error);
    }, function(change) {
      if (change.deleted) {
        ppnetPostHelper.deletePost($scope.posts, change); // Deletes post from array
        ppnetPostHelper.deleteLike($scope.likes, change); // Deletes like from array
      } else {
        // Fetch the change event and assign the change to the specific array
        switch (change.doc.type) {
          case 'POST':
            if (change.doc.msg.match(new RegExp('#' + $routeParams.hashtag, 'gi')))
              $scope.posts.push(change);
            break;
          case 'LIKE':
            ppnetPostHelper.loadLike($scope.likes, change);
            break;
          case 'COMMENT':
            ppnetPostHelper.loadComment($scope.comments, change);
            break;
          case 'IMAGE':
            if (!angular.isUndefined(change.doc._attachments)) {
              $scope.posts.push(change);
            }
            break;
        }
      }
    });

    var loadMeta = function(response) {
      for (var i = response.length - 1; i >= 0; i--) {
        switch (response[i].doc.type) {
          case 'LIKE':
            ppnetPostHelper.loadLike($scope.likes, response[i]);
            break;
          case 'COMMENT':
            ppnetPostHelper.loadComment($scope.comments, response[i]);
            break;
        }
      }
    };

    // Get the next 10 posts from the database, startkey defines the offset of the request
    var loadDocuments = function(startkey) {

      // Gets all Documents, including Posts, Images, Comments and Likes
      ppSyncService.getPostsWithTag($routeParams.hashtag).then(function(response) {
        // Loop through the response and assign the elements to the specific temporary arrays
        for (var i = response.length - 1; i >= 0; i--) {
          // Posts and Images are pushed to the same array because,
          // they are both top parent elements
          $scope.posts.push(response[i]);

          // GET META ASSETS
          ppSyncService.getRelatedDocuments(response[i].id).then(loadMeta);
        }
        $scope.loadingStream = false;
      });
    };
    loadDocuments();

    // Get all likes and comments 
    /*
     */

    $scope.loadMore = function() {
      $scope.loadingStream = true;
      var oldestTimestamp = 9999999999999;
      for (var i = 0; i < $scope.posts.length; i++) {

        if (oldestTimestamp > $scope.posts[i].value) {
          oldestTimestamp = $scope.posts[i].value;
        }
      }
      loadDocuments(oldestTimestamp - 1);
    };

    $scope.isPostedByUser = function(user) {
      return user.id === ppnetUser.getId() ? true : false;
    };

    $scope.deletePost = function(postId) {
      ppnetPostHelper.findPostInArray($scope.posts, postId).then(function(response) {
        var currentObject = $scope.posts[response];

        $scope.posts.splice(response, 1);
        ppSyncService.deleteDocument(currentObject.doc, true);
        return true;
      });
    };

    $scope.top = function(likes) {
      console.log(likes);
      if (likes >= 2) {
        return 'big';
      } else if (likes >= 1) {
        return 'medium';
      }
    };

    $scope.$on("$destroy", function() {
      ppSyncService.cancel();
    });
  });
'use strict';

angular.module('PPnet')

.controller('MapController', function($scope, $routeParams, ppSyncService, ppnetGeolocation, ppnetConfig) {
  var defaultLatitude = ppnetConfig.getMapviewDefaultLatitude(),
    defaultLongitude = ppnetConfig.getMapviewDefaultLongitude(),
    defaultZoom = ppnetConfig.getMapviewDefaultZoom(),
    markers = new L.MarkerClusterGroup();


  if ($routeParams.long && $routeParams.lat && $routeParams.zoom) {
    ppnetGeolocation.setCurrentMapLocation({
      lat: $routeParams.lat,
      long: $routeParams.long,
      zoom: $routeParams.zoom
    });
  } else if (ppnetGeolocation.getCurrentUserPosition() && !ppnetGeolocation.getCurrentMapLocation()) {
    ppnetGeolocation.setCurrentMapLocation({
      lat: ppnetGeolocation.getCurrentUserPosition().latitude,
      long: ppnetGeolocation.getCurrentUserPosition().longitude,
      zoom: defaultZoom
    });
  } else if (!ppnetGeolocation.getCurrentMapLocation()) {
    ppnetGeolocation.setCurrentMapLocation({
      lat: defaultLatitude,
      long: defaultLongitude,
      zoom: defaultZoom
    });
  }

  var map = L.mapbox.map('map', 'philreinking.i4kmekeh')
    .setView([ppnetGeolocation.getCurrentMapLocation().lat, ppnetGeolocation.getCurrentMapLocation().long], ppnetGeolocation.getCurrentMapLocation().zoom);

  L.control.locate().addTo(map);

  map.on('moveend ', function() {
    var newcoords = map.getCenter();
    ppnetGeolocation.setCurrentMapLocation({
      long: map.getCenter().lng,
      lat: map.getCenter().lat,
      zoom: map.getZoom()
    });
  });

  var markerIcon = L.icon({
    iconUrl: 'vendor/mapbox/images/marker-icon.png',
    iconRetinaUrl: 'vendor/mapbox/images/marker-icon-2x.png',
    iconSize: [25, 41],
    iconAnchor: [25, 41],
    popupAnchor: [-12, -40],
    shadowUrl: 'vendor/mapbox/images/marker-shadow.png',
    shadowRetinaUrl: 'vendor/mapbox/images/marker-shadow.png',
    shadowSize: [41, 41],
    shadowAnchor: [25, 41]
  });

  // Gets all Documents, including Posts, Images, Comments and Likes
  ppSyncService.getPosts().then(function(response) {
    // Loop through the response and assign the elements to the specific temporary arrays
    for (var i = response.length - 1; i >= 0; i--) {
      switch (response[i].doc.type) {
        case 'POST':
        case 'IMAGE':
          $scope.addToMap(response[i].doc);
          break;
      }
    }
  });

  ppSyncService.fetchChanges().then(function(response) {
    //console.log(response);
  }, function(error) {
    console.log(error);
  }, function(change) {
    if (!change.deleted) {
      // Fetch the change event and assign the change to the specific array
      switch (change.doc.type) {
        case 'POST':
          $scope.addToMap(change.doc);
          break;
        case 'IMAGE':
          if (!angular.isUndefined(change.doc._attachments)) {
            $scope.addToMap(change.doc);
          }
          break;
      }
    }
  });

  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  // This function adds a marker and 
  $scope.addToMap = function(doc) {
    if (!angular.isUndefined(doc.coords) && doc.coords.longitude && doc.coords.latitude) {
      doc.content = '<span style="color: #bf004d;">' + doc.user.name + '</span><br>' + doc.msg;

      if (doc.type === 'IMAGE') {
        ppSyncService.getAttachment(doc._id, 'image').then(function(response) {
          var reader = new FileReader();

          reader.onload = function(e) {
            doc.content = doc.content + '<img src="' + e.target.result + '">';
            /**
              L.marker([doc.coords.latitude, doc.coords.longitude], {
                icon: markerIcon
              })
                .addTo(map)
                .bindPopup(doc.content);**/
            var marker = L.marker([doc.coords.latitude, doc.coords.longitude], {
              icon: markerIcon
            })
              .bindPopup(doc.content);
            markers.addLayer(marker);
            map.addLayer(markers);
          };

          // Convert the BLOB to DataURL
          if (response)
            reader.readAsDataURL(response);
        });
      } else {
        var marker = L.marker([doc.coords.latitude, doc.coords.longitude], {
          icon: markerIcon
        })
          .bindPopup(doc.content);

        markers.addLayer(marker);
        map.addLayer(markers);
      }


    }
  };

  $scope.$on("$destroy", function() {
    ppSyncService.cancel();
  });

});
'use strict';

angular.module('PPnet')
  .controller('UserController', function($scope, $routeParams, ppSyncService, ppnetPostHelper) {

    $scope.posts = [];
    $scope.comments = [];
    $scope.likes = [];

    $scope.userId = $routeParams.id;

    var loadMeta = function(response) {
      for (var i = response.length - 1; i >= 0; i--) {
        switch (response[i].doc.type) {
          case 'LIKE':
            ppnetPostHelper.loadLike($scope.likes, response[i]);
            break;
          case 'COMMENT':
            ppnetPostHelper.loadComment($scope.comments, response[i]);
            break;
        }
      }
    };

    ppSyncService.getUserPosts($routeParams.id).then(function(response) {
      // Loop through the response and assign the elements to the specific temporary arrays
      for (var i = response.length - 1; i >= 0; i--) {
        $scope.posts.push(response[i]);
        // GET META ASSETS
        ppSyncService.getRelatedDocuments(response[i].id).then(loadMeta);
      }
    });

    ppSyncService.fetchChanges().then(function(response) {
      //console.log(response);
    }, function(error) {
      console.log(error);
    }, function(change) {
      if (change.deleted) {
        ppnetPostHelper.deletePost($scope.posts, change); // Deletes post from array
        ppnetPostHelper.deleteLike($scope.likes, change); // Deletes like from array
      } else {
        // Fetch the change event and assign the change to the specific array
        switch (change.doc.type) {
          case 'POST':
            $scope.posts.push(change);
            break;
          case 'LIKE':
            ppnetPostHelper.loadLike($scope.likes, change);
            break;
          case 'COMMENT':
            ppnetPostHelper.loadComment($scope.comments, change);
            break;
          case 'IMAGE':
            if (!angular.isUndefined(change.doc._attachments)) {
              $scope.posts.push(change);
            }
            break;
        }
      }
    });

    $scope.$on('$destroy', function() {
      ppSyncService.cancel();
    });
  });
'use strict';
angular.module('PPnet')
  .controller('LoadController', function($scope, $location, $routeParams, ppnetConfig, ppSyncService) {

    ppnetConfig.loadConfigFromExternal().then(function(response) {
        ppnetConfig.init(response.data);
      },
      function(error) {
        console.log(error);
      },
      function(change) {
        console.log(change);
      });
  });
'use strict';
angular.module('PPnet')
    .controller('configController', function($scope, $location, $routeParams, ppnetConfig, ppnetUser) {

        $scope.$watch(
            function() {
                return ppnetConfig.existingConfig();
            },
            function(newValue, oldValue) {
                if (newValue) {
                    setHeader(ppnetConfig.loadConfig());
                }
            }
        );

        $scope.isLogedIn = ppnetUser.isLogedIn();
        console.log($scope.isLogedIn);

        var setHeader = function(config) {
            $scope.config = config;
        }
    });