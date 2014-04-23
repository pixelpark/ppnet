'use strict';

angular.module('PPnet')
  .controller('NewPostController', function($scope, ppSyncService, ppnetUser, ppnetPostHelper) {

    $scope.user = ppnetUser.getUserData();

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

    // Creates a new Post
    $scope.newPost = function() {
      var msg = $scope.newPost.content;
      if (typeof msg !== 'undefined' && msg.length > 0 && !toggleAdmin(msg)) {
        // Create the object which should be saved
        var postObject = ppnetPostHelper.createPostObject(
          $scope.newPost.content,
          ppnetUser.getUserData()
        );

        // Save the object to the database
        ppSyncService.postDocument(postObject);
      }
      // Empty the textarea
      $scope.newPost.content = '';
    };
  });