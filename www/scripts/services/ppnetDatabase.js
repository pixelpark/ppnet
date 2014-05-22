'use strict';

var ppSync = angular.module('ppSync', ['ng']);

ppSync.factory('ppSyncService', function($q, $window) {

  var dbname = 'pixelpark_dev';
  // var remote = 'http://127.0.0.1:5984/' + dbname;
  var remote = 'http://couchdb.simple-url.com:5984/' + dbname;


  /* Create the PouchDB object */
  var db = new PouchDB(dbname, {
    auto_compaction: true,
    cache: false
  });

  //var db = new PouchDB('http://127.0.0.1:5984/' + dbname);
  //var db = new PouchDB('http://couchdb.simple-url.com:5984/' + dbname)


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
    };
  }

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
  createDesignDocs();


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
      setTimeout(function() {
        PouchDB.replicate(remote, dbname, {
          continuous: true
        });
      }, 1000);
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
  syncFromRemote();

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
  monitorNetwork();
  var changes;
  return {

    /**
     * Implements the changes method from pouchdb to notify about each new document added
     * to the local database.
     * @return {promise}
     */
    fetchChanges: function() {
      var deferred = $q.defer();

      changes = db.changes({
        continuous: true,
        since: 'latest',
        include_docs: true,
        attachments: true,
        complete: function(err, changes) {
          deferred.resolve(changes);
          deferred.reject(err);
        },
        onChange: function(change) {
          deferred.notify(change);
        }
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
});