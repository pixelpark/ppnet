angular.module('PPnet')
  .factory('ppnetConfig', function($http, $q, ppSyncService, ppnetUser) {
    var config;

    localStorage.removeItem('ppnetConfig');

    function loadConfigFromLocalStorage() {
      config = JSON.parse(localStorage.getItem('ppnetConfig'));
      this.config = config;
      return config;;
    }

    function saveConfigtoLocalStorage(config) {
      this.config = config;
      localStorage.setItem('ppnetConfig', JSON.stringify(config));
    }

    function init(config) {

      /* SET CONFIG TO POUCHDB BEFORE INIT() */
      ppSyncService.setDB(config).then(function(response) {
        ppSyncService.init();
        if (!ppnetUser.isLogedIn()) {
          // and redirect to login view if not
          window.location = '#/login';
        } else {
          window.location = '#/';
        }
      });
    }

    return {
      init: function(config) {
        if (!config) {
          return init(loadConfigFromLocalStorage());
        } else {
          init(config);
          saveConfigtoLocalStorage(config);
        }

      },
      existingConfig: function() {
        config = loadConfigFromLocalStorage();
        return (config) ? true : false;
      },
      loadConfig: function() {
        return loadConfigFromLocalStorage();
      },
      loadConfigFromExternal: function() {
        var deferred = $q.defer();
        $http.get('config.json').then(function(res) {
          deferred.resolve(res);
          deferred.reject(res);
          deferred.notify(res);
        });
        return deferred.promise;
      },
      saveConfig: function(config) {
        saveConfigtoLocalStorage(config)
      },



      getMapviewDefaultLatitude: function() {
        return config.mapview.defaultLatitude;
      },
      getMapviewDefaultLongitude: function() {
        return config.mapview.defaultLongitude;
      },
      getMapviewDefaultZoom: function() {
        return config.mapview.defaultZoom;
      }
    }
  });
'use strict';

angular.module('ppSync', ['ng'])
  .provider('ppSyncService', function ppSyncServiceProvider() {
    this.$get = function($q, $window) {


      var dbname = '';
      var remote = '';
      var db;

      function init() {
        /* Create the PouchDB object */
        db = new PouchDB(dbname, {
          //adapter: 'websql',
          auto_compaction: true,
          cache: false
        });
      }

      /**
       * The Cache is used to store newly created document_ids while beeing offline.
       */
      function Cache() {
        this.docs = [];
      }

      Cache.prototype.addDoc = function(docId) {
        if (JSON.parse(localStorage.getItem('cache')) !== null) {
          this.docs = JSON.parse(localStorage.getItem('cache'));
        }
        this.docs.push(docId.id);
        localStorage.setItem('cache', JSON.stringify(this.docs));
      };

      Cache.prototype.getDocs = function() {
        return JSON.parse(localStorage.getItem('cache'));
      };

      Cache.prototype.removeDoc = function(docId) {
        if (JSON.parse(localStorage.getItem('cache')) !== null) {
          this.docs = JSON.parse(localStorage.getItem('cache'));
        }
        for (var i = this.docs.length - 1; i >= 0; i--) {
          if (this.docs[i] === docId) {
            this.docs.splice(i, 1);
            localStorage.setItem('cache', JSON.stringify(this.docs));
            return true;
          }
        }
      };

      Cache.prototype.reset = function() {
        this.docs = [];
        localStorage.setItem('cache', JSON.stringify(this.docs));
      };

      /**
       * The syncCache function syncs the changes made to the local database while offline.
       * On success the cache gets cleaned.
       */
      var cache = new Cache();
      var syncCache = function() {

        var tempIds = cache.getDocs();
        if (tempIds.length > 0) {
          var current = tempIds[tempIds.length - 1];
          db.replicate.to(remote, {
            doc_ids: [current]
          }).on('complete', function(res, err) {
            if (res.ok) {
              cache.removeDoc(current);
              syncCache();
            }
          });
        }
      };

      /**
       * Create map/reduce design documents
       */

      var createDesignDocs = function() {

        // Posts Only
        var postsOnly = {
          _id: '_design/posts_only',
          views: {
            'posts_only': {
              map: function(doc) {
                if (doc.type === 'POST' || doc.type === 'IMAGE') {
                  emit([doc.created, doc._id, doc.user.id], doc.created);
                }
              }.toString()
            }
          }
        };
        db.put(postsOnly).then(function() {
          return db.query('posts_only', {
            stale: 'update_after'
          });
        });

        // User Posts Only
        var useronly = {
          _id: '_design/user_posts',
          views: {
            'user_posts': {
              map: function(doc) {
                if (doc.type === 'POST' || doc.type === 'IMAGE') {
                  emit([doc.user.id, doc.created, doc._id], doc.created);
                }
              }.toString()
            }
          }
        };
        db.put(useronly).then(function() {
          return db.query('user_posts', {
            stale: 'update_after'
          });
        });

        // Related docs only
        var relatedDocs = {
          _id: '_design/related_docs',
          views: {
            'related_docs': {
              map: function(doc) {
                if (doc.type === 'COMMENT') {
                  emit(doc.posting, doc.created);
                } else if (doc.type === 'LIKE') {
                  emit(doc.posting, doc.created);
                }
              }.toString()
            }
          }
        };
        db.put(relatedDocs).then(function() {
          return db.query('related_docs', {
            stale: 'update_after'
          });
        });

        // Docs with Tags
        var tags = {
          _id: '_design/tags',
          views: {
            'tags': {
              map: function(doc) {
                if (typeof doc.tags !== 'undefined' && doc.tags !== null && doc.tags.length > 0) {
                  for (var i = 0; i < doc.tags.length; i++) {
                    emit(doc.tags[i], doc.created);
                  }
                }
              }.toString()
            }
          }
        };
        db.put(tags).then(function() {
          return db.query('tags', {
            stale: 'update_after'
          });
        });
      };



      /**
       * The sync function starts 2 types of replication processes.
       * The first process is the replicate.from function. It replicates all database changes
       * made on the remote couchdb server to the local pouchdb instance.
       */
      var syncFromRemote = function() {


        // This is a filter function which can be used in a replication function to collect
        // only documents which pass the filter condition.
        // This filter checks the timestamp of a document and returns false if the timestamp
        // is older than 24 hours.
        var syncFilter = function(doc) {
          var timeBarrier = Date.now() - (86400 * 1000);
          return doc.created > timeBarrier ? true : false;
        };

        // This is the continuousSync function which replicates changes from the remote couchdb
        // server. It starts with a delay of 1 second to ensure that there is no conflict with
        // previous replication processes.
        var continuousSync = function() {

          db.replicate.from(remote, {
            live: true
          });

        };

        // Starts the replication process with a filter function to fetch only a subset
        // of documents. After completing the replication, the continuousSync function gets
        // called.
        PouchDB.replicate(remote, dbname, {
          continuous: false,
          filter: syncFilter,
          batch_size: 1000,
          complete: continuousSync
        });
      };


      /**
       * This function monitors the network connection used by a webview. The navigator object
       * provides for this two events, which fires when the device goes online or offline.
       *
       * The online event listener is used to restart the replication process.
       */
      var network = 'online';
      var monitorNetwork = function() {

        if ('connection' in navigator) {

          var onOfflineHandler = function() {
            network = 'offline';
            console.log(network);
          };

          var onOnlineHandler = function() {
            network = 'online';
            console.log(network);
            syncCache();
            syncFromRemote();
          };

          $window.addEventListener('offline', onOfflineHandler, false);
          $window.addEventListener('online', onOnlineHandler, false);

        }
        // Check the Network Connection
        else if ('onLine' in navigator) {
          $window.addEventListener('offline', function() {
            network = 'offline';
            console.log(network);
          });
          $window.addEventListener('online', function() {
            network = 'online';
            console.log(network);
            // Starts the syncCache function to push changes made while offline.
            syncCache();

            // Restart the syncFromRemote function.
            syncFromRemote();
          });
        }

      };


      var setDBname = function(config) {
        dbname = config.database.name;
      };
      var setRemote = function(config) {
        remote = config.database.remote + config.database.name;
      };

      var changes;
      return {
        init: function() {
          init();
          syncFromRemote();
          createDesignDocs();
          monitorNetwork();
        },
        setDB: function(config) {
          var deferred = $q.defer();

          setDBname(config);
          setRemote(config);

          deferred.resolve('ok');
          deferred.reject('ok');
          deferred.notify('ok');

          return deferred.promise;
        },

        getInfo: function() {
          var deferred = $q.defer();

          db.info(function(err, info) {
            deferred.resolve(info);
            deferred.reject(err);
            deferred.notify(info);
          });


          return deferred.promise;
        },
        /**
         * Implements the changes method from pouchdb to notify about each new document added
         * to the local database.
         * @return {promise}
         */
        fetchChanges: function() {
          var deferred = $q.defer();

          db.info(function(err, info) {
            changes = db.changes({
              live: true,
              since: info.update_seq,
              include_docs: true,
              attachments: true
            })
              .on('error', function(err) {
                deferred.reject(err);
              })
              .on('complete', function(resp) {
                deferred.resolve(resp);
              })
              .on('change', function(change) {
                deferred.notify(change);
              });
          });


          return deferred.promise;
        },

        /**
         * Implements the post method from pouchdb to store a new document in the database.
         * When the device is online, the document gets immediately synced to the server,
         * otherwise it is stored in the cache.
         * @param  {object} obj
         * @return {promise}
         */
        postDocument: function(obj) {
          var deferred = $q.defer();

          db.post(obj).then(function(response) {

            cache.addDoc(response);
            if (network === 'online') {
              syncCache();
            }
            deferred.resolve(response);
          }).
          catch (function(error) {
            deferred.reject(error);
          });

          return deferred.promise;
        },

        /**
         * Implements the putAttachment Method from PouchDB
         * @return {promise}
         */
        putAttachment: function(docId, attachmentId, rev, doc, type) {
          var deferred = $q.defer();

          db.putAttachment(docId, attachmentId, rev, doc, type, function(err, response) {
            cache.addDoc(response);
            if (network === 'online') {
              syncCache();
            }
            deferred.resolve(response);
          });

          return deferred.promise;
        },

        getAttachment: function(docId, attachmentId) {
          var deferred = $q.defer();

          db.getAttachment(docId, attachmentId, function(err, response) {
            deferred.resolve(response);
          });

          return deferred.promise;
        },

        /**
         * Implements the delete function from pouchdb and accepts two parameters. The first one contains
         * the doc which should be deleted and the second one defines whether the change should be pushed
         * to the server or stored in the puffer.
         * @param  {object} doc
         * @param  {boolean} push
         * @return {promise}
         */
        deleteDocument: function(doc, push) {
          var deferred = $q.defer();

          push = typeof push !== 'undefined' ? push : true;

          db.remove(doc, {}, function(err, response) {

            cache.addDoc(response);
            if (network === 'online' && push === true) {
              syncCache();
            }
            deferred.resolve(response);
          });

          return deferred.promise;
        },

        /**
         * This function returns a single document by passing the docId
         * @param  {string} docId
         * @return {promise}
         */
        getDocument: function(docId) {
          var deferred = $q.defer();

          db.get(docId).then(function(doc) {
            deferred.resolve(doc);
          });

          return deferred.promise;
        },

        getRelatedDocuments: function(docId) {
          var deferred = $q.defer();

          var queryOptions = {
            descending: true,
            include_docs: true,
            key: docId
          };

          db.query('related_docs', queryOptions).then(function(response) {
            deferred.resolve(response.rows);
          });

          return deferred.promise;
        },

        getUserPosts: function(userId) {
          var deferred = $q.defer();

          // Set the query options
          var queryOptions = {
            descending: true,
            include_docs: true,
            startkey: [userId, {}, {}],
            endkey: [userId]
          };

          db.query('user_posts', queryOptions).then(function(response) {
            deferred.resolve(response.rows);
          });

          return deferred.promise;
        },

        /**
       * The getDocuments function is used to query a large amount of documents stored in the local
       * database. Additionally, the function "joins" together related data.
       * An array as parameter is used to define the types and "join order" of the queried documents.
       * An example array would look like ['
              POST ', '
              COMMENT ', '
              LIKE ']. The function then queries the
       * database for this type.
       *
       * More on CouchDB Joins http://www.cmlenz.net/archives/2007/10/couchdb-joins
       *
       * @param  {string} documentType
       * @return {promise}
       */
        getPosts: function(limit, startkey) {
          var deferred = $q.defer();

          // Set the query options
          var queryOptions = {
            descending: true,
            include_docs: true
          };

          if (!angular.isUndefined(startkey)) {
            queryOptions.startkey = startkey;
          }

          if (!angular.isUndefined(limit)) {
            queryOptions.limit = limit;
          }

          db.query('posts_only', queryOptions).then(function(response) {
            deferred.resolve(response.rows);
          });

          return deferred.promise;
        },

        getPostsWithTag: function(tag) {
          var deferred = $q.defer();

          // Set the query options
          var queryOptions = {
            descending: true,
            include_docs: true
          };

          if (!angular.isUndefined(tag)) {
            queryOptions.key = tag;
          }

          db.query('tags', queryOptions).then(function(response) {
            deferred.resolve(response.rows);
          });

          return deferred.promise;
        },

        /**
         * The syncCache function is a way to start syncing the documents stored in the cache to the
         * remote server.
         */
        syncCache: function() {
          syncCache();
        },

        /**
         * This function returns the database info object containing the amount of documents,
         * the update sequence and the database name.
         * @return promise
         */
        debug: function() {
          var deferred = $q.defer();

          db.info().then(function(response) {
            console.log('online', network);
            deferred.resolve(response);
          }).
          catch (function(error) {
            console.log(error);
          });

          return deferred.promise;
        },

        /**
         * Return the URL of the remote server
         */
        getRemoteUrl: function() {
          return remote;
        },

        /**
         * Resets the database by deleting the current database and creating a new one.
         */
        reset: function() {
          PouchDB.destroy(dbname);
          db = new PouchDB(dbname);
        },

        cancel: function() {
          changes.cancel();
        }
      };
    };
  });
'use strict';

angular.module('PPnet')
  .service('global_functions', function() {

    this.showTimestamp = function(timestamp) {
      // Set the maximum time difference for showing the date
      var maxTimeDifferenceForToday = Math.round((new Date()).getTime() / 1000) - this.ageOfDayInSeconds();
      var maxTimeDifferenceForYesterday = maxTimeDifferenceForToday - 86400;
      var postTime = timestamp / 1000;
      if ((postTime > maxTimeDifferenceForYesterday) && (postTime < maxTimeDifferenceForToday)) {
        return 'yesterday';
      } else if (postTime < maxTimeDifferenceForToday) {
        return 'older';
      }
      return 'today';
    };

    this.time = function(timestamp) {
      timestamp = timestamp / 1000;
      return timestamp;
    };


    this.ageOfDayInSeconds = function() {
      var dt = new Date();
      return dt.getSeconds() + (60 * dt.getMinutes()) + (60 * 60 * dt.getHours());
    };

    this.apply = function(scope) {
      if (!scope.$$phase) {
        scope.$apply();
      }
    };

    this.showLoader = function(items) {
      if (items.length >= 1) {
        return false;
      }
      return true;
    };

    this.orderByCreated = function(item) {
      if (item.created) {
        return item.created;
      } else if (item.doc.created) {
        return item.doc.created;
      }
    };

    this.isDeletable = function(item, user_id) {
      if (item.doc.user.id === user_id) {
        return true;
      }
      return false;
    };
  });
'use strict';

angular.module('PPnet')
  .factory('ppnetUser', function() {

    // User Attributes that are saved to local storage
    var userAttributes = {
      id: '',
      name: '',
      provider: '',
      admin: false,
      online: false
    };

    var currentUser = userAttributes;

    // Initiliaze the Local Storage
    var initUser = function() {
      if (!localStorage.getItem('ppnetUser')) {
        localStorage.setItem('ppnetUser', JSON.stringify(userAttributes));
      }
    };
    initUser();

    // Helper Function to save and retrieve the LocalStorage Data
    var loadCurrentUserFromLocalStorage = function() {
      currentUser = JSON.parse(localStorage.getItem('ppnetUser'));
    };

    var saveCurrentUsertoLocalStorage = function() {
      localStorage.setItem('ppnetUser', JSON.stringify(currentUser));
    };

    return {
      login: function(newUserData) {
        currentUser.id = newUserData.id;
        currentUser.name = newUserData.name;
        currentUser.provider = newUserData.provider;
        currentUser.online = true;
        currentUser.admin = false;
        saveCurrentUsertoLocalStorage();
        window.location = '#/';
        return true;
      },
      logout: function() {
        currentUser = userAttributes;
        saveCurrentUsertoLocalStorage();
      },
      isLogedIn: function() {
        loadCurrentUserFromLocalStorage();
        return (currentUser.online) ? true : false;
      },
      isAdmin: function() {
        loadCurrentUserFromLocalStorage();
        return (currentUser.admin) ? true : false;
      },
      toggleAdmin: function(newStatus) {
        loadCurrentUserFromLocalStorage();
        currentUser.admin = newStatus;
        saveCurrentUsertoLocalStorage();
      },
      getUserData: function() {
        loadCurrentUserFromLocalStorage();
        return currentUser;
      },
      getName: function() {
        loadCurrentUserFromLocalStorage();
        return currentUser.name;
      },
      getId: function() {
        loadCurrentUserFromLocalStorage();
        return currentUser.id;
      }
    };

  });
'use strict';

angular.module('PPnet')
  .factory('ppnetPostHelper', function($q, ppnetGeolocation) {

    var defaultPost = {
      msg: '',
      created: false,
      user: false,
      coords: false,
      tags: [],
      type: 'POST'
    };

    var defaultImage = {
      msg: '',
      created: false,
      user: false,
      coords: false,
      tags: [],
      type: 'IMAGE'
    };
    var defaultLike = {
      created: false,
      user: false,
      coords: false,
      type: 'LIKE',
      posting: false
    };
    var defaultComment = {
      msg: '',
      created: false,
      user: false,
      coords: false,
      tags: [],
      type: 'COMMENT',
      posting: false
    };

    var getTags = function(content) {
      var tempTags = [];
      if (!angular.isUndefined(content)) {
        tempTags = content.match(/(#[a-z\d-]+)/ig);
      }
      if (tempTags !== null) {
        for (var i = 0; i < tempTags.length; i++) {
          tempTags[i] = tempTags[i].split("#").join('');
        }
      }
      return tempTags;
    };

    return {
      loadComment: function(comments, newEntry) {
        var postId = newEntry.doc.posting;
        // Checks if there are already comments for the postId
        if (!(postId in comments)) {
          // Initialize an empty array
          comments[postId] = [];
        }
        comments[postId].push(newEntry);
      },
      loadLike: function(likes, newEntry) {
        var postId = newEntry.doc.posting;
        if (!(postId in likes)) {
          likes[postId] = [];
        }
        likes[postId].push(newEntry);
      },
      createPostObject: function(content, user) {
        var tempPost = defaultPost;
        tempPost.created = new Date().getTime();
        tempPost.coords = ppnetGeolocation.getCurrentCoords();
        tempPost.user = {
          id: user.id,
          name: user.name
        };
        tempPost.msg = content;
        tempPost.tags = getTags(content);
        return tempPost;
      },
      createImageObject: function(content, user) {
        var tempImage = defaultImage;
        tempImage.created = new Date().getTime();
        tempImage.coords = ppnetGeolocation.getCurrentCoords();
        tempImage.user = {
          id: user.id,
          name: user.name
        };
        tempImage.tags = getTags(content);
        tempImage.msg = angular.isUndefined(content) ? '' : content;
        return tempImage;
      },
      createLikeObject: function(user, posting) {
        var tempLike = defaultLike;
        tempLike.created = new Date().getTime();
        tempLike.coords = ppnetGeolocation.getCurrentCoords();
        tempLike.user = {
          id: user.id,
          name: user.name
        };
        tempLike.posting = posting;
        return tempLike;
      },
      createCommentObject: function(content, user, posting) {
        var tempComment = defaultComment;
        tempComment.msg = content;
        tempComment.created = new Date().getTime();
        tempComment.coords = ppnetGeolocation.getCurrentCoords();
        tempComment.user = {
          id: user.id,
          name: user.name
        };
        tempComment.tags = getTags(content);
        tempComment.posting = posting;
        return tempComment;
      },
      deleteLikeLocal: function(likes, postId, userId) {
        var deferred = $q.defer();
        var result = false;
        if (!angular.isUndefined(likes[postId])) {
          for (var i = 0; i < likes[postId].length; i++) {
            if (likes[postId][i].doc.user.id === userId) {
              result = likes[postId][i].doc;
              break;
            }
          }
        }
        if (result) {
          deferred.resolve(result);
        } else {
          deferred.reject('No ID found');
        }
        return deferred.promise;
      },
      deleteLike: function(likes, deleted) {
        for (var key in likes) {
          for (var i = 0; i < likes[key].length; i++) {
            if (likes[key][i].id === deleted.id) {
              likes[key].splice(i, 1);
            }
          }
        }
      },
      deleteComment: function(comments, deleted) {
        for (var key in comments) {
          for (var i = 0; i < comments[key].length; i++) {
            if (comments[key][i].id === deleted.id) {
              comments[key].splice(i, 1);
            }
          }
        }
      },
      deletePost: function(posts, deleted) {
        for (var i = 0; i < posts.length; i++) {
          if (posts[i].id === deleted.id) {
            posts.splice(i, 1);
            break;
          }
        }
      },
      findPostInArray: function(posts, id) {
        var deferred = $q.defer();
        var result = false;

        for (var i = 0; i < posts.length; i++) {
          if (posts[i].id === id) {
            result = i;
            break;
          }
        }

        if (result) {
          deferred.resolve(result);
        } else {
          deferred.reject('No ID found');
        }
        return deferred.promise;
      }
    };
  });
'use strict';

angular.module('PPnet')
  .factory('ppnetGeolocation', function() {

    var watchID;
    var coords = {};

    var showPosition = function(position) {
      coords.latitude = position.coords.latitude;
      coords.longitude = position.coords.longitude;
      coords.accuracy = position.coords.accuracy;
      saveCurrentLocationtoLocalStorage();
    };

    var errorHandler = function(err) {
      if (err.code === 1) {
        console.log('Error: Access is denied!');
      } else if (err.code === 2) {
        console.log('Error: Position is unavailable!');
      }
      coords.latitude = null;
      coords.longitude = null;
      coords.accuracy = null;
      saveCurrentLocationtoLocalStorage();
    };

    var getLocationUpdate = function() {
      coords.latitude = null;
      coords.longitude = null;
      coords.accuracy = null;
      if (navigator.geolocation) {
        // timeout at 60000 milliseconds (60 seconds)
        var options = {
          timeout: 60000
        };
        watchID = navigator.geolocation.watchPosition(showPosition, errorHandler, options);
      } else {
        console.log('Sorry, browser does not support geolocation!');
      }
    };
    var saveCurrentLocationtoLocalStorage = function() {
      localStorage.setItem('ppnetLocation', JSON.stringify(coords));
    };
    var loadCurrentPositionFromLocalStorage = function() {
      return JSON.parse(localStorage.getItem('ppnetLocation'));;
    };

    var saveCurrentMapPositionToLocalStorage = function(position) {
      localStorage.setItem('ppnetMapPosition', JSON.stringify(position));
    };
    var loadCurrentMapPositionFromLocalStorage = function(position) {
      return JSON.parse(localStorage.getItem('ppnetMapPosition'));;
    };

    return {
      getCurrentUserPosition: function() {
        var position = loadCurrentPositionFromLocalStorage();
        if (position == null || (position.latitude == null && position.longitude == null))
          return false;
        return position;
      },
      setCurrentMapLocation: function(position) {
        saveCurrentMapPositionToLocalStorage(position);
      },
      getCurrentMapLocation: function() {
        return loadCurrentMapPositionFromLocalStorage();
      },

      getCurrentCoords: function() {
        return coords;
      },
      startGeoWatch: function() {
        getLocationUpdate();
      }
    };
  });