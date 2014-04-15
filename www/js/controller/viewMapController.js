app.controller('MapController', ['$scope', '$routeParams', '$rootScope', 'ppSyncService',
  function($scope, $routeParams, $rootScope, ppSyncService) {
    $rootScope.postingPossible = false;

    var rand = Math.floor(Math.random() * 1000);
    var myControllername = 'PostingController' + rand;
    $rootScope.activeController = myControllername;

    var mapview = false;
    var map;
    var viewsize = window.innerHeight - 130;

    /**
     * MapView
     * mit leaflet.js und OpenStreetMap
     */
    $scope.loadMapView = function() {
      mapview = true;
      jQuery('#map').css('height', viewsize + 'px');
      map = L.map('map').setView([$routeParams.long, $routeParams.lat], $routeParams.zoom);
      L.tileLayer('http://{s}.tile.cloudmade.com/c89f01daa9684630881b71ece61c646c/997/256/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
      }).addTo(map);
    }

    $scope.addMarkerToMap = function(posting) {
      console.log(posting);
      if (posting.doc.coords.longitude != null) {
        if (posting.doc.image) {
          var image = new Image($scope, posting);
          image.content = posting.doc.msg.trim();
          var marker = L.marker([posting.doc.coords.latitude, posting.doc.coords.longitude])
            .addTo(map)
            .bindPopup('<span style="color:#bf004d;">' + posting.doc.user.name + '</span><br>' + '<div id="image_' + posting.id + '"></div>');
          image.loadImage(ppSyncService.getRemoteUrl() + '/' + image.id + '/image');
          //getImage(posting.doc._id, posting.doc.created, posting.doc.coords.latitude, posting.doc.coords.longitude, posting.doc.user.name);
        } else {
          var marker = L.marker([posting.doc.coords.latitude, posting.doc.coords.longitude])
            .addTo(map)
            .bindPopup('<span style="color: #bf004d;">' + posting.doc.user.name + '</span><br>' + posting.doc.msg);
        }
      }
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
          $scope.addMarkerToMap(new Posting($scope, change));
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
                $scope.addMarkerToMap(new Posting($scope, row));

                break;
            };
          }
        });
      });
    };




  }
]);