app.controller('ReportController', ['$scope', '$routeParams', '$rootScope', 'global_functions', 'ppSyncService',
  function($scope, $routeParams, $rootScope, global_functions, ppSyncService) {

    var rand = Math.floor(Math.random() * 1000);
    var myControllername = 'PostingController' + rand;
    $rootScope.activeController = 'PostingController' + rand;
    var db_changes = new Object();

    /*
     *  INIT VARS
     */
    $rootScope.postingPossible = false;

    $scope.global_functions = global_functions;

    $scope.posting_functions = {};
    $scope.report_functions = {};

    $scope.types = new Array();
    $scope.reports = new Array();


    $scope.apply = function() {
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    };

    ppSyncService.fetchChanges().then(function(response) {
      //console.log(response);
    }, function(error) {
      console.log(error);
    }, function(change) {
      if (myControllername != $rootScope.activeController) {
        db_changes[rand].cancel();
        return;
      }
      if ($scope.types[change.id]) {
        if ($scope.types[change.id].type && !change.doc.type) {
          change.doc.type = $scope.types[change.id].type;
        }
      }
      console.log(change);
      switch (change.doc.type) {
        case "REPORT":
          console.log();
          new Report($scope, change).onChange(change);
          $scope.apply();
          break;
      };
    });

    $scope.report_functions.delete = function(doc) {
      console.log('report_functions.delete');
      ppSyncService.deleteDocument(new Report($scope, doc).delete());
    };

    $scope.report_functions.deletePosting = function(doc) {
      console.log('report_functions.deletePosting');
      ppSyncService.deleteDocument(new Posting($scope, doc.doc.posting));
      ppSyncService.deleteDocument(new Report($scope, doc).delete());
    };




    $scope.getDocuments = function() {
      ppSyncService.getDocuments(['REPORT']).then(function(response) {
        $scope.reports = [];
        angular.forEach(response, function(row, key) {
          if (row.doc.created) {
            switch (row.doc.type) {
              case "REPORT":
                new Report($scope, row).createToScope(row);
                break;
            };
          }
          $scope.apply();
        });
      });
    };


    $scope.$on("$destroy", function() {
      ppSyncService.cancel();
    });
  }
]);