'use strict';

angular.module('ppnetApp').controller('PostMetaController', function ($scope, ppSyncService, ppnetPostHelper, ppnetUser) {

    $scope.like = function (postId) {
        $scope.inProgress = true;
        if ($scope.isLiked(postId)) {
            ppnetPostHelper.deleteLikeLocal($scope.likes, postId, ppnetUser.user.id).then(function (result) {
                ppSyncService.deleteDocument(result, true).then(function () {
                    $scope.inProgress = false;
                });
            });
        } else {
            var user = ppnetUser.user;
            var likeObject = ppnetPostHelper.createLikeObject(user, postId);

            ppSyncService.postDocument(likeObject).then(function () {
                $scope.inProgress = false;
            });
        }
    };



    /*$scope.newLike = function (postId) {
        console.log($scope.isLiked(postId));
        $scope.inProgress = true;

        var user = ppnetUser.user;
        var likeObject = ppnetPostHelper.createLikeObject(user, postId);

        ppSyncService.postDocument(likeObject).then(function () {
            $scope.inProgress = false;
        });
    };

    $scope.deleteLike = function (postId) {
        $scope.inProgress = true;

        ppnetPostHelper.deleteLikeLocal($scope.likes, postId, ppnetUser.user.id)
                .then(function (result) {
                    ppSyncService.deleteDocument(result, true).then(function () {
                        $scope.inProgress = false;
                    });
                });
    };*/

    $scope.isLiked = function (postId) {
        var userId = ppnetUser.user.id;
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

    $scope.isCommented = function (postId) {
        var userId = ppnetUser.user.id;

        if (!angular.isUndefined($scope.comments[postId])) {
            for (var i = 0; i < $scope.comments[postId].length; i++) {
                var currentObject = $scope.comments[postId][i];
                if (currentObject.doc.user.id === userId) {
                    return true;
                }
            }
        }
    };

    $scope.isTrending = function (likes) {
        if (likes >= 10) {
            return 'big';
        } else if (likes >= 5) {
            return 'medium';
        }
    };
});