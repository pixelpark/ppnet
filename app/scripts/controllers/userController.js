'use strict';

angular.module('ppnetApp')
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