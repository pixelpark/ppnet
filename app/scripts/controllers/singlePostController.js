'use strict';

angular.module('ppnetApp')
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

    ppSyncService.fetchChanges().then(function() {
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
      return user.id === ppnetUser.user.id ? true : false;
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



    $scope.$on('$destroy', function() {
      ppSyncService.cancel();
    });
  });