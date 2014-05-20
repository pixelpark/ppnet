'use strict';
angular.module('PPnet')
  .controller('HashtagController', function($scope, $location, $routeParams, ppSyncService, ppnetPostHelper, ppnetUser) {
    $scope.posts = [];
    $scope.comments = [];
    $scope.likes = [];

    $scope.hashtag = $scope.model_hashtag = $routeParams.hashtag;


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