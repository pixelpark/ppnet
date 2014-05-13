'use strict';
angular.module('PPnet')
  .controller('StreamController', function($scope, ppSyncService, ppnetPostHelper, ppnetUser) {
    $scope.posts = [];
    $scope.comments = [];
    $scope.likes = [];



    $scope.loadingStream = true;

    var db = ppSyncService.fetchChanges().then(function(response) {
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

    var loadDocuments = function(startkey) {
      if (angular.isUndefined(startkey)) {
        startkey = [9999999999999, {}, {}];
      } else {
        startkey = [startkey, {}, {}];
      }

      // Limits the number of returned documents
      var limit = 10;

      // Gets all Documents, including Posts, Images, Comments and Likes
      ppSyncService.getDocuments(['POST', 'IMAGE'], limit, startkey).then(function(response) {
        // Loop through the response and assign the elements to the specific temporary arrays
        for (var i = response.length - 1; i >= 0; i--) {
          // Posts and Images are pushed to the same array because,
          // they are both top parent elements
          $scope.posts.push(response[i]);
          ppSyncService.getRelatedDocuments(response[i].id, 'LIKE').then(function(response) {
            for (var i = response.length - 1; i >= 0; i--) {
              ppnetPostHelper.loadLike($scope.likes, response[i]);
            }
          });
          ppSyncService.getRelatedDocuments(response[i].id, 'COMMENT').then(function(response) {
            for (var i = response.length - 1; i >= 0; i--) {
              ppnetPostHelper.loadComment($scope.comments, response[i]);
            }
          });
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


    $scope.$on("$destroy", function() {
      ppSyncService.cancel();
    });
  });