'use strict';

angular.module('PPnet')
  .controller('MapController', function($scope, $routeParams, ppSyncService) {

    // Initialize the Mapbox Map
    var map = L.mapbox.map('map', 'philreinking.i4kmekeh')
      .setView([50.9348416, 6.9522126], 16);


    // Gets all Documents, including Posts, Images, Comments and Likes
    ppSyncService.getDocuments(['POST', 'IMAGE', 'COMMENT', 'LIKE']).then(function(response) {
      // Loop through the response and assign the elements to the specific temporary arrays
      for (var i = response.length - 1; i >= 0; i--) {
        switch (response[i].doc.type) {
          case 'POST':
          case 'IMAGE':
            $scope.addToMap(response[i].doc);
            break;
        }
      }
    });

    ppSyncService.fetchChanges().then(function(response) {
      console.log(response);
    }, function(error) {
      console.log(error);
    }, function(change) {
      if (!change.deleted) {
        // Fetch the change event and assign the change to the specific array
        switch (change.doc.type) {
          case 'POST':
          case 'IMAGE':
            $scope.addToMap(change.doc);
            break;
        }
      }
    });

    // This function adds a marker and 
    $scope.addToMap = function(doc) {
      if (!angular.isUndefined(doc.coords)) {
        L.marker([doc.coords.latitude, doc.coords.longitude])
          .addTo(map)
          .bindPopup('<span style="color: #bf004d;">' + doc.user.name + '</span><br>' + doc.msg);
      }
    };

  });