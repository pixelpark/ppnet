'use strict';

angular.module('ppnetApp')
    .controller('MapController', function ($scope, $stateParams, ppSyncService, ppnetGeolocation, ppnetConfig) {

        $scope.channels = ppSyncService.getChannels();
        $scope.getCurrentChannel = function () {
            return ppSyncService.getActiveChannel();
        };

        var def = {}, mapId, mapToken, markers = new L.MarkerClusterGroup(), mapLocation, mapContainer, mapElement, map, userLocation;

        var footer = document.getElementById('footer'); // SOME SORT OF EVIL
        var timeoutId;
        function setSize() {
            if (mapContainer && footer) {
                mapElement.style.height = (window.innerHeight - mapContainer.offsetTop - footer.offsetHeight) + 'px';
            }
            map.invalidateSize();
        }
        var resizeHandler = function () {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(setSize, 50);
        };

        function setSizeHandler() {
            window.requestAnimFrame(setSize);
            window.addEventListener('resize', resizeHandler, false);
        }
        
        $scope.$on('$includeContentLoaded', function () {
            setSizeHandler();
        });
        

        var updateLocation = function (coords) {
            userLocation.latitude = coords.latitude;
            userLocation.longitude = coords.longitude;
            // SET MARKER TO THIS POSITION!
        };
        
        

        ppnetConfig.getMapviewData().then(function (result) {
            def.lat = result.defaultLatitude;
            def.long = result.defaultLongitude;
            def.zoom = result.defaultZoom;

            mapId = result.mapid;
            mapToken = result.accesstoken;

            if ($stateParams.long && $stateParams.lat && $stateParams.zoom) {
                ppnetGeolocation.setCurrentMapLocation({
                    lat: $stateParams.lat,
                    long: $stateParams.long,
                    zoom: $stateParams.zoom
                });
            } else if (ppnetGeolocation.getCurrentUserPosition() && !ppnetGeolocation.getCurrentMapLocation()) {
                ppnetGeolocation.setCurrentMapLocation({
                    lat: ppnetGeolocation.getCurrentUserPosition().latitude,
                    long: ppnetGeolocation.getCurrentUserPosition().longitude,
                    zoom: def.zoom
                });
            } else if (!ppnetGeolocation.getCurrentMapLocation()) {
                ppnetGeolocation.setCurrentMapLocation(def);
            }

            mapLocation = ppnetGeolocation.getCurrentMapLocation() || def;
            mapContainer = $('#map')[0];

            mapElement = mapContainer.children[0];

            if (mapElement._leaflet) {

                map = window.old;
            } else {
                map = L.mapbox.map(mapElement, mapId, {
                    accessToken: mapToken
                }).setView([mapLocation.lat, mapLocation.long], mapLocation.zoom);
            }

            userLocation = ppnetGeolocation.getCurrentUserPosition() || {latitude: def.lat, longitude: def.long};

            ppnetGeolocation.register(updateLocation);

            var setUserPosition = function (e) {
                e.stopPropagation();
                e.preventDefault();
                map.setView([userLocation.latitude, userLocation.longitude], 16);
            };

            map.on('moveend ', function () {
                var center = map.getCenter();
                var zoom = map.getZoom();
                if (center && zoom) {
                    ppnetGeolocation.setCurrentMapLocation({
                        long: center.lng,
                        lat: center.lat,
                        zoom: zoom
                    });
                }
            });


            var locateControl = L.control();
            locateControl.setPosition('topleft');
            locateControl.onAdd = function () {
                var container = document.createElement('div');
                container.className = 'leaflet-control-locate leaflet-bar leaflet-control';
                var link = document.createElement('a');
                link.className = 'leaflet-bar-part leaflet-bar-part-single btn-locate icon ion-ios-location';
                link.href = '#';
                link.addEventListener('click', setUserPosition);
                link.addEventListener('touchstart', setUserPosition);
                container.appendChild(link);
                return container;
            };

            map.addControl(locateControl);



            var markerIcon = L.icon({
                iconUrl: 'styles/images/marker-icon.png',
                iconRetinaUrl: 'styles/images/marker-icon-2x.png',
                iconSize: [25, 41],
                iconAnchor: [25, 41],
                popupAnchor: [-12, -40],
                shadowUrl: 'styles/images/marker-shadow.png',
                shadowRetinaUrl: 'styles/images/marker-shadow.png',
                shadowSize: [41, 41],
                shadowAnchor: [25, 41]
            });

            // Gets all Documents, including Posts, Images, Comments and Likes
            var getPostings = function () {
                ppSyncService.getPosts().then(function (response) {
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
            };

            var fetchingChanges = function () {
                ppSyncService.fetchChanges().then(function () {
                    //console.log(response);
                }, function (error) {
                    console.log(error);
                }, function (change) {
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

            };


            getPostings();
            fetchingChanges();

            $scope.switchChannel = function (channel) {
                if (ppSyncService.setChannel(channel)) {
                    markers.eachLayer(function (layer) {
                        markers.removeLayer(layer);
                    });
                    getPostings();
                    fetchingChanges();
                }
                ;
            };


            // This function adds a marker and
            $scope.addToMap = function (doc) {
                if (!map)
                    return;
                if (!angular.isUndefined(doc.coords) && doc.coords.longitude && doc.coords.latitude) {
                    doc.content = '<h4';
                    if (doc.type === 'IMAGE') {
                        doc.content += ' style="width:280px;"';
                    }
                    doc.content += '><i class="fa fa-user"></i> <a href="#/user/' + doc.user.id + '">' + doc.user.name + '</a></h4>';
                    if (doc.msg) {
                        doc.content += doc.msg + '<br>';
                    }

                    if (doc.type === 'IMAGE') {
                        ppSyncService.getAttachment(doc._id, 'image').then(function (response) {
                            var reader = new FileReader();

                            reader.onload = function (e) {
                                if (!map)
                                    return;
                                doc.content += '<div><img src="' + e.target.result + '"></div>';
                                doc.content += '<a href="#/post/' + doc._id + '" class="btn btn-block btn-info"><i class="fa fa-comment fa-custom"></i></a>';
                                var marker = L.marker([doc.coords.latitude, doc.coords.longitude], {
                                    icon: markerIcon
                                }).bindPopup(doc.content);

                                markers.addLayer(marker);
                                map.addLayer(markers);
                            };

                            // Convert the BLOB to DataURL
                            if (response) {
                                reader.readAsDataURL(response);
                            }
                        });
                    } else {
                        doc.content += '<a href="#/post/' + doc._id + '" class="btn btn-block btn-info"><i class="fa fa-comment fa-custom"></i></a>';
                        var marker = L.marker([doc.coords.latitude, doc.coords.longitude], {
                            icon: markerIcon
                        })
                                .bindPopup(doc.content);

                        markers.addLayer(marker);
                        map.addLayer(markers);
                    }
                }
            };
        });

        $scope.$on('$destroy', function () {
            window.removeEventListener('resize', resizeHandler, false);
            window.old = map;
            //window.old = true;
            //mapContainer.removeChild(mapElement);
            //map.remove();
            //map = undefined;
            ppnetGeolocation.unregister(updateLocation);
            ppSyncService.cancel();
        });
    });