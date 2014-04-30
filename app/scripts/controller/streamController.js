'use strict';
angular.module('PPnet')
  .controller('StreamController', function($scope, ppSyncService, ppnetPostHelper) {

    $scope.posts = [];
    $scope.comments = [];
    $scope.likes = [];
    $scope.images = [];

    $scope.loadingStream = true;

    // Gets all Documents, including Posts, Comments and Likes
    ppSyncService.getDocuments(['POST', 'IMAGE', 'COMMENT', 'LIKE']).then(function(response) {
      // Loop through the response and assign the elements to the specific temporary arrays
      for (var i = response.length - 1; i >= 0; i--) {
        switch (response[i].doc.type) {
          case 'POST':
          case 'IMAGE':
            $scope.posts.push(response[i]);
            break;
          case 'LIKE':
            ppnetPostHelper.loadLike($scope.likes, response[i]);
            break;
          case 'COMMENT':
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
        ppnetPostHelper.deleteLike($scope.likes, change);
      } else {
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

    $scope.top = function(likes) {
      console.log(likes);
      if (likes >= 2) {
        return 'big';
      } else if (likes >= 1) {
        return 'medium';
      }
    };
  });