'use strict';

angular.module('PPnet')
  .controller('TimelineController', function($scope, $routeParams, $rootScope, ppSyncService) {
    $rootScope.postingPossible = false;

    var rand = Math.floor(Math.random() * 1000);
    var myControllername = 'PostingController' + rand;
    $rootScope.activeController = myControllername;

    var viewsize = window.innerHeight - 130;
    $scope.timelineoptions = {
      "width": "100%",
      "minHeight": 500,
      "height": viewsize + "px",
      "style": "box",
      "cluster": true,
      "axisOnTop": true,
      "animate": false,
      "zoomMin": 1 * 60 * 1000,
      "zoomMax": 2 * 7 * 24 * 60 * 60 * 1000
    };

    ppSyncService.fetchChanges().then(function(response) {
      console.log(response);
    }, function(error) {
      console.log(error);
    }, function(change) {

      if (myControllername != $rootScope.activeController) {
        return;
      }

      if ($scope.types[change.id]) {
        if ($scope.types[change.id].type && !change.doc.type) {
          change.doc.type = $scope.types[change.id].type;
        }
      }
      switch (change.doc.type) {
        case "POST":
          $scope.prepareForTimeline(new Posting($scope, change));
          break;
      };
    });


    $scope.getDocuments = function() {
      ppSyncService.getDocuments(['POST']).then(function(response) {
        $scope.postings = [];
        $scope.likes = {};
        $scope.comments = {};
        $scope.types = {};
        angular.forEach(response, function(row, key) {
          if (row.doc.created) {
            switch (row.doc.type) {
              case "POST":
                $scope.prepareForTimeline(new Posting($scope, row));
                break;
            };
          }
        });
      });
    };


    $scope.timelineZoomIn = function() {
      timeline.zoom(1);
    };
    $scope.timelineZoomOut = function() {
      timeline.zoom(-1);
    };
    $scope.centerNow = function() {
      timeline.setVisibleChartRangeNow();
    };
    $scope.prepareForTimeline = function(doc) {
      if (doc.doc.msg.trim() != '') {
        doc.content = doc.doc.msg.trim();
        $scope.pushToTimeline(doc);
      }
      if (doc.doc.image) {
        var image = new Image($scope, doc);
        image.content = doc.doc.msg.trim();
        $scope.pushToTimeline(image);
        image.loadImage(ppSyncService.getRemoteUrl() + '/' + image.id + '/image');
      }
    };

    $scope.pushToTimeline = function(doc) {
      timeline.addItem({
        'start': new Date(doc.doc.created),
        'end': '', // end is optional
        'content': doc.content + '<br>',
        'editable': false
      });

      $('a.magnific-popup').magnificPopup({
        type: 'image',
        closeOnContentClick: true,
        closeBtnInside: true
      });
    };


  });