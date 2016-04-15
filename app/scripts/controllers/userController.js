'use strict';

angular.module('ppnetApp')
    .controller('UserController', function ($scope, ppSyncService, ppnetPostHelper, ppnetUser, $stateParams) {

        $scope.posts = [];
        $scope.comments = [];
        $scope.likes = [];
        $scope.channels = ppSyncService.getChannels();

        $scope.userId = $stateParams.id;

        $scope.getCurrentChannel = function () {
            return ppSyncService.getActiveChannel();
        };

        $scope.switchChannel = function (channel) {
            if (ppSyncService.setChannel(channel)) {
                $scope.posts = [];
                $scope.comments = [];
                $scope.likes = [];
                loadDocuments();
                fetchingChanges();
            }
        };


        $scope.isPostedByUser = function (user) {
            return user.id === ppnetUser.user.id ? true : false;
        };


        var loadMeta = function (response) {
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

        var loadDocuments = function () {
            ppSyncService.getUserPosts($scope.userId).then(function (response) {
                // Loop through the response and assign the elements to the specific temporary arrays
                if (response.length > 0 && response[0].doc.user.name) {
                    $scope.userName = response[0].doc.user.name;
                }

                for (var i = response.length - 1; i >= 0; i--) {
                    if (response[i].doc.type === 'POST' || response[i].doc.type === 'IMAGE' ) {
                        $scope.posts.push(response[i]);
                    }
                    // GET META ASSETS

                    ppSyncService.getRelatedDocuments(response[i].id).then(loadMeta);
                }
            });
        };

        var fetchingChanges = function () {
            ppSyncService.fetchChanges().then(function () {
                //console.log(response);
            }, function (error) {
                console.log(error);
            }, function (change) {
                if (change.deleted) {
                    ppnetPostHelper.deletePost($scope.posts, change); // Deletes post from array
                    ppnetPostHelper.deleteLike($scope.likes, change); // Deletes like from array
                } else {

                    if (change.doc.user.id === $scope.userId) {
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

                }
            });
        };

        loadDocuments();
        fetchingChanges();


        $scope.$on('$destroy', function () {
            ppSyncService.cancel();
        });
    });