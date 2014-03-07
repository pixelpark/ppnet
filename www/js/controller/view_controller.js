app.controller('ViewController', ['$scope', '$routeParams', '$rootScope',
	function($scope, $routeParams, $rootScope) {

		if (typeof timeline != 'undefined') {
			delete timeline;
		}


		var rand = Math.floor(Math.random() * 1000);
		var myControllername = 'PostingController' + rand;
		$rootScope.activeController = 'PostingController' + rand;
		var db_changes = new Object();

		var mapview = false;
		var map;



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

		/*
		 *  INIT VARS
		 */
		$rootScope.postingPossible = false;

		$scope.global_functions = ($scope.global_functions) ? $scope.global_functions : {};
		$scope.posting = {};
		$scope.posting_functions = {};
		$scope.postings = [];
		$scope.comment = {};
		$scope.comment_functions = {};
		$scope.comments = {};
		$scope.like = {};
		$scope.like_functions = {};
		$scope.likes = {};
		$scope.types = {};
		$scope.image_posts = [];

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
					//console.log('onChange');
					/*
					 *  SET DOC.TYPE IF NOT AVAILABLE
					 */
					if (myControllername != $rootScope.activeController) {
						db_changes[rand].cancel();
						return;
					}

					if ($scope.types[change.id]) {
						if ($scope.types[change.id].type && !change.doc.type) {
							change.doc.type = $scope.types[change.id].type;
						}
					}
					switch (change.doc.type) {
						case "POST":
							$scope.posting_functions.onChange(change);
							if (mapview) {
								$scope.addMarkerToMap(change.doc);
							}
							break;
						case "LIKE":
							$scope.like_functions.onChange(change);
							break;
						case "COMMENT":
							$scope.comment_functions.onChange(change);
							break;
					};
				},
				complete: function(err, response) {

				}
			});
		});

		/*
		 *  POSTING
		 */
		$scope.posting_functions.onChange = function(change) {
			if (change.deleted) {
				angular.forEach($scope.postings, function(value, key) {
					if (value.id == change.id) {
						$scope.postings.splice(key, 1);
					}
				});
			} else if (!$scope.types[change.id]) {
				if (change.doc.image && !change.doc._attachments) {

				} else if (change.doc.image && change.doc._attachments) {

					$scope.types[change.id] = ({
						type: 'POST'
					});
					$scope.likes[change.id] = new Array();
					if (change.doc.user.id == $scope.user.getId() && $scope.images[change.id]) {
						change.temp_img = $scope.images[change.id];
					}

					if (typeof timeline !== 'undefined') {
						$scope.global_functions.prepareForTimeline(change.doc);
					} else if ($scope.image_posts) {
						getImage(change.id, change.doc.created);
					}

					if ($scope.postings)
						$scope.postings.push(change);
					$scope.apply();
				} else {
					$scope.types[change.id] = ({
						type: 'POST'
					});
					$scope.likes[change.id] = new Array();

					$scope.postings.push(change);

					if (typeof timeline !== 'undefined') {
						$scope.global_functions.prepareForTimeline(change.doc);
					};
				}
			}
			$scope.apply();
		};


		$scope.posting_functions.isPost = function(doc) {
			if (doc.type == 'POST') {
				emit([doc._id, 0], doc);
			}
			if (doc.type == 'LIKE') {
				emit([doc.posting, 1], doc);
			}
			if (doc.type == 'COMMENT') {
				emit([doc.posting, 2], doc);
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
		 *  LIKE-Functions
		 */
		$scope.like_functions.createToScope = function(change) {
			//console.log('$scope.like_functions.createToScope');
			$scope.types[change.id] = {
				type: 'LIKE',
				posting: change.doc.posting
			};
			if (!$scope.likes[change.doc.posting])
				$scope.likes[change.doc.posting] = new Array();
			$scope.likes[change.doc.posting].push(change);
			$scope.apply();
		};
		$scope.like_functions.deleteFromScope = function(id) {
			//console.log('$scope.like_functions.deleteFromScope');
			if ($scope.types[id]) {
				angular.forEach($scope.likes[$scope.types[id].posting], function(value, key) {
					if (value.id == id) {
						$scope.likes[$scope.types[id].posting].splice(key, 1);
						$scope.apply();
					}
				});
			}
		};
		$scope.like_functions.onChange = function(change) {
			//console.log('$scope.like_functions.onChange');
			if (change.deleted) {
				if ($scope.likes[$scope.types[change.id].posting])
					$scope.like_functions.deleteFromScope(change.id);
			} else {
				if ($scope.likes[change.doc.posting]) {
					angular.forEach($scope.likes[change.doc.posting], function(row, key) {
						if (change.doc.user.id == $scope.user.getId()) {
							$scope.like_functions.deleteFromScope(row._id);
						}
					});
				}
				$scope.like_functions.createToScope(change);
			}
		};


		/*
		 *  COMMENT FUNCTIONS
		 */
		$scope.comment_functions.showComments = function(item) {
			if (!$scope.comments[item]) {
				return false;
			}
			return true;
		};
		$scope.comment_functions.deleteFromScope = function(id) {
			angular.forEach($scope.comments[$scope.types[id].posting], function(value, key) {
				if (value.id == id) {
					$scope.comments[$scope.types[id].posting].splice(key, 1);
					$scope.apply();
				}
			});
		};
		$scope.comment_functions.onChange = function(change) {
			if (change.deleted) {
				$scope.comment_functions.deleteFromScope(change.id);
			} else {
				$scope.types[change.id] = {
					type: 'COMMENT',
					posting: change.doc.posting
				};
				if (!$scope.comments[change.doc.posting])
					$scope.comments[change.doc.posting] = new Array();
				$scope.comments[change.doc.posting].push(change);
				$scope.apply();
			}
		};


		/*
		 *
		 *  GLOBAL
		 *
		 */
		$scope.global_functions.showLoader = function(item) {
			if (isotope || timeline || $scope.postings.length >= 1) {
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

		if (!$scope.postings)
			$scope.postings = [];
		$scope.global_functions.showWall = function() {
			$scope.db.query({
				map: $scope.posting_functions.isPost
			}, {
				reduce: true
			}, function(err, response) {
				$scope.postings = [];
				$scope.likes = {};
				$scope.comments = {};
				$scope.types = {};
				$scope.response = response;

				var counter = 0;
				angular.forEach(response.rows, function(row, key) {
					counter++;
					if (row.value) {
						row.doc = row.value;
						delete row.value;
					}
					if (row.doc.created) {
						switch (row.doc.type) {
							case "POST":
								$scope.types[row.id] = {
									type: 'POST'
								};
								$scope.postings.push(row);
								if (typeof timeline !== 'undefined') {
									$scope.global_functions.prepareForTimeline(row.doc);
								};
								if (!$scope.likes[row.id]) {
									$scope.likes[row.id] = new Array();
								}
								if (!$scope.comments[row.id]) {
									$scope.comments[row.id] = new Array();
								}
								if (mapview) {
									$scope.addMarkerToMap(row.doc);
								}

								break;
							case "LIKE":
								if (!$scope.types[row.id]) {
									$scope.types[row.id] = new Array();
								}
								$scope.types[row.id] = {
									type: 'LIKE',
									posting: row.doc.posting
								};
								if (!$scope.likes[row.doc.posting]) {
									break;
								};
								$scope.likes[row.doc.posting].push(row);
								break;
							case "COMMENT":
								if (!$scope.types[row.id]) {
									$scope.types[row.id] = new Array();
								}
								$scope.types[row.id] = {
									type: 'COMMENT',
									posting: row.doc.posting
								};
								if (!$scope.comments[row.doc.posting]) {
									break;
								};
								$scope.comments[row.doc.posting].push(row);
								break;
						};
					}
					$scope.apply();

					if (response.rows.length == counter) {
						//$scope.global_functions.loadTimeline();
					}
				});

			});
		};

		/**
		 * MapView
		 * mit leaflet.js und OpenStreetMap
		 */

		$scope.loadMapView = function() {
			mapview = true;
			jQuery('#map').css('height', viewsize + 'px');
			map = L.map('map').setView([50.9188, 6.9242], 15);

			L.tileLayer('http://{s}.tile.cloudmade.com/c89f01daa9684630881b71ece61c646c/997/256/{z}/{x}/{y}.png', {
				attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
				maxZoom: 18
			}).addTo(map);
		}

		$scope.addMarkerToMap = function(doc) {
			if (doc.coords.longitude != null) {
				if (doc.image) {
					getImage(doc._id, doc.created, doc.coords.latitude, doc.coords.longitude, doc.user.name);
				} else {
					var marker = L.marker([doc.coords.latitude, doc.coords.longitude])
						.addTo(map)
						.bindPopup('<span style="color: #bf004d;">' + doc.user.name + '</span><br>' + doc.msg);
				}
			}
		};



		/*
		 *
		 *  TIMELINE
		 *
		 */

		$scope.timelineZoomIn = function() {
			//console.log('zoomIn');
			timeline.zoom(1);
		};

		$scope.timelineZoomOut = function() {
			//console.log('zoomOut');
			timeline.zoom(-1);
		};

		$scope.centerNow = function() {
			timeline.setVisibleChartRangeNow();
		};

		$scope.global_functions.loadTimeline = function() {
			var today = new Date();

			angular.forEach($scope.postings, function(row, key) {
				$scope.global_functions.prepareForTimeline(row.doc);
			});
		};

		$scope.global_functions.prepareForTimeline = function(doc) {
			//console.log('prepareForTimeline');
			var date = new Date(doc.created);
			if (doc.msg.trim() != '') {
				//console.log(doc.image);
				$scope.global_functions.pushToTimeline(date, doc.msg);
			}

			if (doc.image) {

				getImage(doc._id, date);
			}
		};

		$scope.global_functions.pushToTimeline = function(date, content) {
			//console.log(timeline);
			if (typeof timeline !== 'undefined') {
				timeline.addItem({
					'start': date,
					'end': '', // end is optional
					'content': content + '<br>',
					'editable': false
				});
			}

			$('a.magnific-popup').magnificPopup({
				type: 'image',
				closeOnContentClick: true,
				closeBtnInside: true
			});

			//timeline.checkResize();
		};



		function getImage(docid, date, latitude, longitude, username) {
			//console.log(docid);
			img = $scope.remoteCouch + '/' + docid + '/image';
			if ($scope.cache) {
				ImgCache.isCached(img, function(path, success) {
					if (success) {
						filename = ImgCache.getShaaaaatFilename(path);
						filepath = ImgCache.getCacheFolderURI();
						content = '<img src="' + filepath + '/' + filename + '" id="' + docid + '">';
						/*
						 *  ADD TO VIEW
						 */
						if (typeof timeline !== 'undefined') {
							content = '<a class="magnific-popup" href="' + filepath + '/' + filename + '">' + content + '</a>';
							$scope.global_functions.pushToTimeline(date, content);
						}
						if (typeof isotope !== 'undefined') {
							content = '<div class="mashup_item"><div class="mashup_img">' + content + '</div></div>';
							isotope.prepend(content).isotope('reloadItems').isotope({
								sortBy: 'original-order'
							});
							isotope.find('img#' + docid).load(function() {
								isotope.isotope('layout');
							});
						}
						if (mapview) {
							content = '<img width="150px" height="auto" src="' + filepath + '/' + filename + '" id="' + docid + '">';
							var marker = L.marker([latitude, longitude])
								.addTo(map)
								.bindPopup('<span style="color: #bf004d;">' + username + '</span><br>' + content);
						}
					} else {
						ImgCache.cacheFile(img, function() {
							getImage(docid, date);
						});
					}
				});
			} else {
				content = '<img height="auto" src="' + img + '" id="' + docid + '">';
				/*
				 *  ADD TO VIEW
				 */
				if (typeof isotope !== 'undefined') {
					content = '<div class="mashup_item"><div class="mashup_img">' + content + '</div></div>';
					isotope.prepend(content).isotope('reloadItems').isotope({
						sortBy: 'original-order'
					});
					isotope.find('img#' + docid).load(function() {
						isotope.isotope('layout');
					});
				}
				if (typeof timeline !== 'undefined') {
					$scope.global_functions.pushToTimeline(date, content);
				}
				if (mapview) {
					content = '<img width="150px" height="auto" src="' + img + '" id="' + docid + '">';
					var marker = L.marker([latitude, longitude])
						.addTo(map)
						.bindPopup('<span style="color: #bf004d;">' + username + '</span><br>' + content);
				}
			}
		}



		/*
		 *  MASHUP FUNCTIONS
		 */
		$scope.hasImage = function(doc) {
			if (doc.image) {
				emit([doc._id, 0], doc);
			}
		};

		$scope.queryImagePosts = function() {
			$scope.loadIsotope();
			$scope.db.query({
				map: $scope.hasImage
			}, {
				reduce: true
			}, function(err, response) {

				$scope.response = response;

				angular.forEach(response.rows, function(row, key) {
					if (row.value) {
						row.doc = row.value;
						delete row.value;
					}
					if (row.doc.created && row.doc.type === 'POST') {
						//$scope.image_posts.push(row);
						var last = 0;
						if (response.rows.length - 1 == key) {
							last = 1;
						}
						getImage(row.doc._id, row.doc.created, last);

					}
					$scope.apply();

				});
			});
		};


		var isotope;
		$scope.loadIsotope = function() {
			if (!isotope) {
				isotope = $('.mashup_wrapper');
				isotope.isotope({
					itemSelector: '.mashup_item',
					masonry: {
						columnWidth: 100
					}
				});
				isotope.isotope('layout');


				// change size of item by toggling gigante class
				isotope.on('click', '.mashup_item', function() {
					$(this).toggleClass('highlight');
					isotope.isotope('layout');
				});
			}
		};
		$scope.apply();
	}
]);