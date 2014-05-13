'use strict';

angular.module('PPnet')
  .controller('UserController', function($scope, $routeParams, ppSyncService, ppnetPostHelper) {

    $scope.posts = [];
    $scope.comments = [];
    $scope.likes = [];
    $scope.images = [];

    $scope.userId = $routeParams.id;


    ppSyncService.getUserDocuments($routeParams.id, ['POST', 'COMMENT', 'LIKE']).then(function(response) {
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
    $scope.$on("$destroy", function() {
      ppSyncService.cancel();
    });
  });