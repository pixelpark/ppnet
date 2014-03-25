app.controller('PostingController', ['$scope', '$routeParams', '$rootScope', 'global_functions', 'ppSyncService',
  function($scope, $routeParams, $rootScope, global_functions, ppSyncService) {

    var rand = Math.floor(Math.random() * 1000);
    var myControllername = 'PostingController' + rand;
    $rootScope.activeController = 'PostingController' + rand;
    var db_changes = new Object();

    /*
     *  INIT VARS
     */
    $rootScope.postingPossible = true;

    $scope.global_functions = global_functions;

    $scope.posting = {};
    $scope.posting_functions = {};
    $scope.postings = [];
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

    ppSyncService.changes().then(function(response) {
      console.log(response);
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
        case "POST":
          new Posting($scope, change.id).onChange(change);
          $scope.apply();
          break;
        case "LIKE":
          new Like($scope, change.id).onChange(change);
          $scope.apply();
          break;
        case "COMMENT":
          new Comment($scope, change.id).onChange(change);
          $scope.apply();
          break;
      };
    });


    /*
     *  POSTING
     */
    $scope.posting.hashtag = ($routeParams.hashtag) ? '#' + $routeParams.hashtag.toUpperCase() : '#';
    $scope.posting_functions.delete = function(posting) {
      var confirmDelete = window.confirm('Do you really want to delete this post?');
      if (confirmDelete) {
        posting.delete();
      }
    };

    /*
     *  LIKE-Functions
     */
    $scope.like_functions.create = function(doc) {
      ppSyncService.post(new Like($scope).create(doc));
      $scope.apply();
    };
    $scope.like_functions.delete = function(like, topush) {
      new Like($scope, like.id).delete();
    };


    /*
     *  COMMENT FUNCTIONS
     */
    $scope.comment_functions.create = function(doc) {
      msg = document.getElementById('comment_' + doc.id).value;
      ppSyncService.post(new Comment($scope).create(doc, msg));
      document.getElementById('comment_' + doc.id).value = '';
    };
    $scope.comment_functions.delete = function(doc, topush) {
      new Comment($scope, doc.id).delete();
    };


    /*
     * REPORT FUNCTIONS
     */
    $scope.report_functions.report = function(posting) {
      var report = new Report($scope).create(posting.id);
    };





    $scope.kindOfDocument = function(doc) {

      if (doc.type == 'POST') {
        emit([doc._id, 0], doc.created);
      }
      if (doc.type == 'LIKE') {
        emit([doc.posting, 1], doc.created);
      }
      if (doc.type == 'COMMENT') {
        emit([doc.posting, 2], doc.created);
      }
    };

    $scope.getDocuments = function() {
      ppSyncService.getDocuments(['POST', 'LIKE', 'COMMENT']).then(function(response) {
        $scope.postings = [];
        $scope.likes = {};
        $scope.comments = {};
        $scope.types = {};
        angular.forEach(response, function(row, key) {
          if (row.doc.created) {
            switch (row.doc.type) {
              case "POST":
                new Posting($scope, row.id).createToScope(row);
                break;
              case "LIKE":
                new Like($scope, row.id).createToScope(row);
                break;
              case "COMMENT":
                new Comment($scope, row.id).createToScope(row);
                break;
            };
          }
          $scope.apply();
        });
      });
    };




    $scope.comment_functions.newComment = function(commentFormOpen, id) {
      if (commentFormOpen) {
        var postId = "#post-" + id;
        var commentForm = "#comment_" + id;
        var parentPosition = $('.snap-content').scrollTop();
        var childPosition = $(postId).offset().top;
        var position = parentPosition + childPosition;

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
  }
]);