'use strict';
angular.module('ppnetApp').controller('SearchController', function ($scope, $stateParams, ppSyncService, ppnetPostHelper, ppnetUser, $state) {
    $scope.channels = ppSyncService.getChannels();
    $scope.getCurrentChannel = function () {
        return ppSyncService.getActiveChannel();
    };

    $scope.model_search = $stateParams.val;

    $scope.switchChannel = function (channel) {
        if (ppSyncService.setChannel(channel)) {
            $scope.posts = [];
            $scope.comments = [];
            $scope.likes = [];
            if ($scope.model_search) {
                search($scope.model_search);
            }

        }
    };

    $scope.posts = [];
    $scope.comments = {};
    $scope.likes = [];

    $scope.found = -1;

    $scope.toggleTimeVar = false;
    $scope.toggleTime = function () {
        $scope.toggleTimeVar = $scope.toggleTimeVar === false ? true : false;
    };

    $scope.search = function () {
        var searchString = $scope.model_search;
        $state.go('search', {val: searchString});
    };

    var search = function (searchString) {
        ppSyncService.search(searchString, ['msg', 'user.name']).then(function (result) {
            $scope.found = result.length;
            var i = result.length - 1, type;
            for (; i >= 0; --i) {
                type = result[i].doc.type;
                if (type === 'POST' || type === 'IMAGE') {
                    var highlight = result[i].highlighting;
                    if (highlight.msg) {
                        
                        // split by <
                        /*if (result[i].doc.user.name === 'auffaellig') {
                            var test = highlight.msg.split('#');
                            var test2 = result[i].doc.msg.split('#');
                            console.log(test, test2);
                        }*/
                        
                        
                        result[i].doc.msg = highlight.msg;
                    } else if (highlight['user.name']) {
                        result[i].doc.user.name = highlight['user.name'];
                    }
                    $scope.posts.push(result[i]);
                    ppSyncService.getRelatedDocuments(result[i].id).then(loadMeta);
                } else if (type === 'COMMENT') {
                    ppnetPostHelper.loadComment($scope, result[i]);

                    ppSyncService.getPost(result[i].doc.posting).then(function (result) {
                        result.highlightComment = true;
                        $scope.posts.push({
                            doc: result
                        });
                        ppSyncService.getRelatedDocuments(result._id).then(loadMeta);
                    });
                }
            }
        }).catch(function () {
            $scope.found = 0;
        });
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

    $scope.isPostedByUser = function (user) {
        return user.id === ppnetUser.user.id ? true : false;
    };

    $scope.deletePost = function (postId) {
        ppnetPostHelper.findPostInArray($scope.posts, postId).then(function (response) {
            var currentObject = $scope.posts[response];

            $scope.posts.splice(response, 1);
            ppSyncService.deleteDocument(currentObject.doc, true);
            return true;
        });
    };
    
    if ($scope.model_search) {
        search($scope.model_search);
    }
});