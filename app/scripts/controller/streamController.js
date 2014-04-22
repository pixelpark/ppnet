'use strict';
angular.module('PPnet')
  .controller('StreamController', function($scope, ppSyncService, ppnetPostHelper) {

    $scope.posts = [];
    $scope.comments = [];
    $scope.likes = [];

    // Gets all Documents, including Posts, Comments and Likes
    ppSyncService.getDocuments(['POST', 'COMMENT', 'LIKE']).then(function(response) {
      // Loop through the response and assign the elements to the specific temporary arrays
      for (var i = response.length - 1; i > 0; i--) {
        switch (response[i].doc.type) {
          case 'POST':
            $scope.posts.push(response[i]);
            break;
          case 'LIKE':
            $scope.likes.push(response[i]);
            break;
          case 'COMMENT':
            ppnetPostHelper.saveComment($scope.comments, response[i])
            break;
        };
      }
    });
  });