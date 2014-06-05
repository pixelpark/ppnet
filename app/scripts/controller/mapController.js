'use strict';

angular.module('PPnet')
  .controller('MapController', function($scope, $routeParams, ppSyncService, ppnetGeolocation) {
    var defaultLatitude = 50.934483,
      defaultLongitude = 6.952426,
      defaultZoom = 14,
      markers = new L.MarkerClusterGroup();

    if ($routeParams.long && $routeParams.lat && $routeParams.zoom) {
      ppnetGeolocation.setCurrentMapLocation({
        lat: $routeParams.lat,
        long: $routeParams.long,
        zoom: $routeParams.zoom
      });
    } else if (ppnetGeolocation.getCurrentUserPosition() && !ppnetGeolocation.getCurrentMapLocation()) {
      ppnetGeolocation.setCurrentMapLocation({
        lat: ppnetGeolocation.getCurrentUserPosition().latitude,
        long: ppnetGeolocation.getCurrentUserPosition().longitude,
        zoom: defaultZoom
      });
    } else if (!ppnetGeolocation.getCurrentMapLocation()) {
      ppnetGeolocation.setCurrentMapLocation({
        lat: defaultLatitude,
        long: defaultLongitude,
        zoom: defaultZoom
      });
    }

    var map = L.mapbox.map('map', 'philreinking.i4kmekeh')
      .setView([ppnetGeolocation.getCurrentMapLocation().lat, ppnetGeolocation.getCurrentMapLocation().long], ppnetGeolocation.getCurrentMapLocation().zoom);

    L.control.locate().addTo(map);

    map.on('moveend ', function() {
      var newcoords = map.getCenter();
      ppnetGeolocation.setCurrentMapLocation({
        long: map.getCenter().lng,
        lat: map.getCenter().lat,
        zoom: map.getZoom()
      });
    });

    var markerIcon = L.icon({
      iconUrl: 'vendor/mapbox/images/marker-icon.png',
      iconRetinaUrl: 'vendor/mapbox/images/marker-icon-2x.png',
      iconSize: [25, 41],
      iconAnchor: [25, 41],
      popupAnchor: [-12, -40],
      shadowUrl: 'vendor/mapbox/images/marker-shadow.png',
      shadowRetinaUrl: 'vendor/mapbox/images/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [25, 41]
    });

    // Gets all Documents, including Posts, Images, Comments and Likes
    ppSyncService.getPosts().then(function(response) {
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
      //console.log(response);
    }, function(error) {
      console.log(error);
    }, function(change) {
      if (!change.deleted) {
        // Fetch the change event and assign the change to the specific array
        switch (change.doc.type) {
          case 'POST':
            $scope.addToMap(change.doc);
            break;
          case 'IMAGE':
            if (!angular.isUndefined(change.doc._attachments)) {
              $scope.addToMap(change.doc);
            }
            break;
        }
      }
    });

    // This function adds a marker and 
    $scope.addToMap = function(doc) {
      if (!angular.isUndefined(doc.coords) && doc.coords.longitude !== null && doc.coords.latitude !== null) {

        doc.content = '<span style="color: #bf004d;">' + doc.user.name + '</span><br>' + doc.msg;

        if (doc.type === 'IMAGE') {
          ppSyncService.getAttachment(doc._id, 'image').then(function(response) {
            var reader = new FileReader();

            reader.onload = function(e) {
              doc.content = doc.content + '<img src="' + e.target.result + '">';
                /**
              L.marker([doc.coords.latitude, doc.coords.longitude], {
                icon: markerIcon
              })
                .addTo(map)
                .bindPopup(doc.content);**/
                var marker = L.marker([doc.coords.latitude, doc.coords.longitude], {
                    icon: markerIcon
                })
                    .bindPopup(doc.content);
                    markers.addLayer(marker);
                map.addLayer(markers);
            };

            // Convert the BLOB to DataURL
            if (response)
              reader.readAsDataURL(response);
          });
        } else {
            var marker = L.marker([doc.coords.latitude, doc.coords.longitude], {
                icon: markerIcon
            })
            .bindPopup(doc.content);

            markers.addLayer(marker);
            map.addLayer(markers);
        }


      }
    };

    $scope.$on("$destroy", function() {
      ppSyncService.cancel();
    });

  });