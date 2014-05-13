'use strict';

angular.module('PPnet')
  .controller('TimelineController', function($scope, ppSyncService) {

    var viewsize = window.innerHeight - 100;
    var timeline = new links.Timeline(document.getElementById('timeline'));
    timeline.draw([], {
      minHeight: 500,
      height: viewsize + 'px',
      animate: false,
      cluster: true,
      style: 'box',
      box: {
        align: 'left'
      },
      zoomMin: 1 * 60 * 1000,
      zoomMax: 2 * 7 * 24 * 60 * 60 * 1000
    });

    // Gets all Documents, including Posts, Images, Comments and Likes
    ppSyncService.getDocuments(['POST', 'IMAGE', 'COMMENT', 'LIKE']).then(function(response) {
      // Loop through the response and assign the elements to the specific temporary arrays
      for (var i = response.length - 1; i >= 0; i--) {
        switch (response[i].doc.type) {
          case 'POST':
          case 'IMAGE':
            // Posts and Images are pushed to the same array because,
            // they are both top parent elements
            $scope.prepareForTimeline(response[i].doc);
            break;
        }
      }
      $scope.loadingStream = false;
    });

    ppSyncService.fetchChanges().then(function(response) {
      console.log(response);
    }, function(error) {
      console.log(error);
    }, function(change) {
      if (!change.deleted) {
        switch (change.doc.type) {
          case 'POST':
          case 'IMAGE':
            $scope.prepareForTimeline(change.doc);
            break;
        }
      }
    });

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
      if ((!angular.isUndefined(doc.msg) && doc.msg.trim() !== '') || doc.type === 'IMAGE') {
        doc.content = '<div class="ppnet-timeline-content">' + doc.msg + '</div>';
        $scope.pushToTimeline(doc);
      }
    };

    $scope.pushToTimeline = function(doc) {
      timeline.addItem({
        'start': new Date(doc.created),
        'end': '', // end is optional
        'content': '<span style="color: #0195A6">' + doc.user.name + '</span>' + '<br>' + doc.content,
        'editable': false
      });
    };

  });