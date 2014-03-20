app.controller('PostingController', ['$scope', '$routeParams', '$rootScope',
    function($scope, $routeParams, $rootScope) {

        var rand = Math.floor(Math.random() * 1000);
        var myControllername = 'PostingController' + rand;
        $rootScope.activeController = 'PostingController' + rand;
        var db_changes = new Object();

        /*
         *  INIT VARS
         */
        $rootScope.postingPossible = true;

        $scope.global_functions = ($scope.global_functions) ? $scope.global_functions : {};
        $scope.posting = {};
        $scope.posting_functions = {};
        $scope.postings = {};
        $scope.comment = {};
        $scope.comment_functions = {};
        $scope.comments = {};
        $scope.like = {};
        $scope.like_functions = {};
        $scope.likes = [];
        $scope.types = {};
        $scope.report_functions = {};

        $scope.apply = function() {
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

        $scope.db.info(function(err, info) {
            db_changes[rand] = $scope.db.changes({
                continuous: true,
                include_docs: true,
                since: info.update_seq,
                onChange: function(change) {
                    if (myControllername != $rootScope.activeController) {
                        db_changes[rand].cancel();
                        return;
                    }
                    if ($scope.types[change.id]) {
                        if ($scope.types[change.id].type && !change.doc.type) {
                            change.doc.type = $scope.types[change.id].type;
                        }
                    }
                    console.log(change.doc.type);
                    switch (change.doc.type) {
                        case "POST":
                            $scope.posting_functions.onChange(change);
                            break;
                        case "LIKE":
                            $scope.like_functions.onChange(change);
                            break;
                        case "COMMENT":
                            $scope.comment_functions.onChange(change);
                            break;
                    };
                },
                complete: function(err, response) {}
            });
        });


        /*
         *  POSTING
         */
        $scope.posting.hashtag = ($routeParams.hashtag) ? '#' + $routeParams.hashtag.toUpperCase() : '#';
        $scope.posting_functions.onChange = function(change) {
            var posting = new Posting($scope, change.id).onChange(change);
        };

        $scope.posting_functions.delete = function(posting) {
            var confirmDelete = window.confirm('Do you really want to delete this post?');
            if (confirmDelete) {
                posting.delete();
            }
        };


        /*
         *  LIKE-Functions
         */
        $scope.like_functions.create = function(posting) {
            var like = new Like($scope).create(posting);
        };
        $scope.like_functions.delete = function(like, topush) {
            var like = new Like($scope, like.id).delete();
        };
        $scope.like_functions.onChange = function(change) {
            var like = new Like($scope, change.id).onChange(change);
        };



        /*
         *  COMMENT FUNCTIONS
         */
        $scope.comment_functions.create = function(posting) {
            var comment = new Comment($scope).create(posting);
        };
        $scope.comment_functions.delete = function(comment, topush) {
            var comment = new Comment($scope, comment.id).delete();
        };
        $scope.comment_functions.onChange = function(change) {
            var comment = new Comment($scope, change.id).onChange(change);
        };


        /*
         * REPORT FUNCTIONS
         */
        $scope.report_functions.report = function(posting) {
            var report = new Report($scope).create(posting.id);
        };




        $scope.comment_functions.newComment = function(commentFormOpen, id) {
            if (commentFormOpen) {
                //console.log("New Comment for Post: #" +id);
                var postId = "#post-" + id;
                var commentForm = "#comment_" + id;
                var parentPosition = $('.snap-content').scrollTop();
                var childPosition = $(postId).offset().top;
                var position = parentPosition + childPosition;
                //console.log(position);
                //$('.snap-content').scrollTo(0,position);

                $('.snap-content').animate({
                    scrollTop: position
                }, 300);
                setTimeout(function() {
                    $(commentForm).focus();
                }, 1);
            }
        };

        $scope.comment_functions.showComments = function(item) {
            if (!$scope.comments[item]) {
                return false;
            }
            return true;
        };






        $scope.global_functions.kindOfDocument = function(doc) {
            if (doc.type == 'POST') {
                emit([doc._id, 0], doc);
            }
            if (doc.type == 'LIKE') {
                emit([doc.posting, 1], doc);
            }
            if (doc.type == 'COMMENT') {
                emit([doc.posting, 2], doc);
            }
        };
        $scope.global_functions.showWall = function() {
            $scope.db.query({
                map: $scope.global_functions.kindOfDocument
            }, {
                reduce: true
            }, function(err, response) {
                $scope.postings = [];
                $scope.likes = {};
                $scope.comments = {};
                $scope.types = {};
                $scope.response = response;

                angular.forEach(response.rows, function(row, key) {
                    if (row.value) {
                        row.doc = row.value;
                        delete row.value;
                    }
                    if (row.doc.created) {
                        switch (row.doc.type) {
                            case "POST":
                                var posting = new Posting($scope, row.id);
                                posting.createToScope(row);
                                break;
                            case "LIKE":
                                var like = new Like($scope, row.id);
                                like.createToScope(row);
                                break;
                            case "COMMENT":
                                var comment = new Comment($scope, row.id);
                                comment.createToScope(row);
                                break;
                        };
                    }
                    $scope.apply();
                });
            });
        };

        function init() {
            stickyActionBar();
        }
        init();

        function deleteFromDB(id) {
            $scope.db.remove(id, function(err, results) {
                $scope.global_functions.toPush(results);
            });
        }



        /*
         *
         *  GLOBAL
         *
         */
        $scope.global_functions.showLoader = function(item) {
            if ($scope.postings.length >= 1) {
                return false;
            }
            return true;
        };

        $scope.global_functions.orderByCreated = function(item) {
            if (item.created)
                return item.created;
            else if (item.doc.created)
                return item.doc.created;
        };

        $scope.global_functions.isDeletable = function(item) {
            if (item.doc.user.id == $scope.user.getId())
                return true;
            return false;
        };



        $scope.time = function(timestamp) {
            timestamp = timestamp / 1000;
            return timestamp;
        };
        $scope.posting_functions.showTimestamp = function(posting) {
            // Set the maximum time difference for showing the date
            maxTimeDifferenceForToday = Math.round((new Date()).getTime() / 1000) - ageOfDayInSeconds();
            maxTimeDifferenceForYesterday = maxTimeDifferenceForToday - 86400;
            postTime = posting.doc.created / 1000;
            if ((postTime > maxTimeDifferenceForYesterday) && (postTime < maxTimeDifferenceForToday)) {
                return 'yesterday';
            } else if (postTime < maxTimeDifferenceForToday) {
                return 'older';
            }
            return 'today';
        };

        function ageOfDayInSeconds() {
            // Calculate beginning of the current day in seconds
            current_date = new Date();
            current_day_hours = current_date.getHours();
            current_day_minutes = current_date.getMinutes();
            return (current_day_hours * 60 * 60) + (current_day_minutes * 60);
        };
    }
]);