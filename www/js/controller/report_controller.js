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

        $scope.posting_functions = {};
        $scope.report_functions = {};

        $scope.types = new Array();
        $scope.reports = new Array();



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
                var report = new Report($scope, doc).delete();
                var posting = new Posting($scope, doc.id).delete();
            }
        };

        $scope.report_functions.isPost = function(doc) {
            if (doc.type == 'REPORT') {
                emit([doc._id, 0], doc);
            }
        };



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