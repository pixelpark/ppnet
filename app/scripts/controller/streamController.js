'use strict';
angular.module('PPnet')
  .controller('StreamController', function($scope, ppSyncService, ppnetPostHelper, ppnetUser) {

    $scope.posts = [];
    $scope.comments = [];
    $scope.likes = [];
    $scope.images = [];

    $scope.loadingStream = true;

    // Gets all Documents, including Posts, Images, Comments and Likes
    ppSyncService.getDocuments(['POST', 'IMAGE', 'COMMENT', 'LIKE']).then(function(response) {
      // Loop through the response and assign the elements to the specific temporary arrays
      for (var i = response.length - 1; i >= 0; i--) {
        switch (response[i].doc.type) {
          case 'POST':
          case 'IMAGE':
            // Posts and Images are pushed to the same array because,
            // they are both top parent elements
            $scope.posts.push(response[i]);
            break;
          case 'LIKE':
            // The loadLike function loads the like to a associative array
            // which relates the likes to the posts
            ppnetPostHelper.loadLike($scope.likes, response[i]);
            break;
          case 'COMMENT':
            // Same as likes
            ppnetPostHelper.loadComment($scope.comments, response[i]);
            break;
        }
      }
      $scope.loadingStream = false;
    });

    ppSyncService.fetchChanges().then(function(response) {
      console.log(response);
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
            // Images generates two change events, so skip the first one
            if (angular.isUndefined($scope.images[change.id])) {
              $scope.images[change.id] = true;
            } else {
              $scope.posts.push(change);
            }
            break;
        }
      }
    });

    $scope.isPostedByUser = function(post) {
      if (post.doc.user.id === ppnetUser.getId())
        return true;
      return false;
    }

    $scope.deletePost = function(postId) {
      ppnetPostHelper.findPostInArray($scope.posts, postId).then(function(response) {
        var currentObject = $scope.posts[response];

        $scope.posts.splice(response, 1);
        ppSyncService.deleteDocument(currentObject.doc, true);
        return true;
      });
    };

    $scope.deleteLike = function(postId) {
      if (!angular.isUndefined($scope.likes[postId])) {
        for (var i = 0; i < $scope.likes[postId].length; i++) {
          var currentObject = $scope.likes[postId][i];
          if (currentObject.doc.user.id === userId) {
            $scope.likes[postId].splice(i, 1);
            ppSyncService.deleteDocument(currentObject.doc, true);
            return true;
          }
        }
      }
    };

    $scope.top = function(likes) {
      console.log(likes);
      if (likes >= 2) {
        return 'big';
      } else if (likes >= 1) {
        return 'medium';
      }
    };
  });