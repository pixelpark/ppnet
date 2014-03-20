app.controller('ReportController', ['$scope', '$routeParams', '$rootScope',
    function($scope, $routeParams, $rootScope) {

        var rand = Math.floor(Math.random() * 1000);
        var myControllername = 'PostingController' + rand;
        $rootScope.activeController = 'PostingController' + rand;
        var db_changes = new Object();

        /*
         *  INIT VARS
         */
        $rootScope.postingPossible = false;

        $scope.global_functions = ($scope.global_functions) ? $scope.global_functions : {};
        $scope.posting = {};
        $scope.posting_functions = {};
        $scope.postings = new Array();
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
                    /*
                     *  SET DOC.TYPE IF NOT AVAILABLE
                     */
                    switch (change.doc.type) {
                        case "REPORT":
                            $scope.report_functions.onChange(change);
                            break;
                    };
                },
                complete: function(err, response) {
                    console.log(err || response);
                }
            });
        });


        /*
         *  POSTING
         */


        $scope.report_functions.onChange = function(change) {
            var report = new Report($scope, change);
            report.onChange(change);
        };

        $scope.report_functions.delete = function(doc) {
            var confirmDelete = window.confirm('Do you really want to unreport this post?');
            if (confirmDelete) {
                var report = new Report($scope, doc).delete();
            }
        };


        $scope.report_functions.deletePosting = function(doc) {
            var confirmDelete = window.confirm('Do you really want to delete this post?');
            if (confirmDelete) {
                var report = new Report($scope, doc);
                report.deletePosting();
                report.delete();
            }
        };




        $scope.report_functions.isPost = function(doc) {
            if (doc.type == 'REPORT') {
                emit([doc._id, 0], doc);
            }
        };


        /*
         *  RENAME?
         */

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

        /*
         *
         *  GLOBAL
         *
         */
        $scope.global_functions.showLoader = function(item) {
            if ($scope.reports.length >= 1) {
                return false;
            }
            return true;
        };

        $scope.global_functions.orderByCreated = function(item) {
            if (item.created)
                return item.created;
            else
                return item.doc.created;
        };

        $scope.global_functions.isDeletable = function(item) {
            if (item.doc.user.id == $scope.user.getId())
                return true;
            return false;
        };

        $scope.reports = [];
        $scope.global_functions.showWall = function() {
            $scope.db.query({
                map: $scope.report_functions.isPost
            }, {
                reduce: true
            }, function(err, response) {
                $scope.reports = [];

                angular.forEach(response.rows, function(row, key) {
                    if (row.value) {
                        row.doc = row.value;
                        delete row.value;
                    }
                    if (row.doc.created) {
                        switch (row.doc.type) {
                            case "REPORT":
                                var report = new Report($scope, row.id).createToScope(row);
                                break;
                        };
                    }
                });
                $scope.apply();
            });
        };



    }
]);