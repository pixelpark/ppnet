'use strict';

var ppSync = angular.module('ppSync', ['ng']);

ppSync.factory('ppSyncService', function($q, $window) {

  var dbname = 'ppnet_default';
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
    this.docs.push(docId);
    localStorage.setItem('cache', JSON.stringify(this.docs));
  };

  Cache.prototype.getDocs = function() {
    return JSON.parse(localStorage.getItem('cache'));
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
    db.replicate.to(remote, {
      doc_ids: cache.getDocs(),
      complete: function(err, response) {
        // Cleans the cache when number of docs replicated to the server equals
        // the length of the cache array.
        if (response.docs_read === cache.getDocs().length) {
          cache.reset();
        }
      }
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
    // Check the Network Connection
    if ('onLine' in navigator) {
      $window.addEventListener('offline', function() {
        network = 'offline';
      });
      $window.addEventListener('online', function() {
        network = 'online';
        // Starts the syncCache function to push changes made while offline.
        syncCache();

        // Restart the syncFromRemote function.
        syncFromRemote();
      });
    }
  };
  monitorNetwork();

  return {

    /**
     * Implements the changes method from pouchdb to notify about each new document added
     * to the local database.
     * @return {promise}
     */
    fetchChanges: function() {
      var deferred = $q.defer();

      db.changes({
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

        // Check the network connection and replicate to server when online
        // else push changed docs to the cache array
        if (network === 'online') {
          db.replicate.to(remote, {
            doc_ids: [response.id],
            complete: function() {
              deferred.resolve(response);
            }
          });
        } else {
          deferred.resolve(response);
          cache.addDoc(response);
        }
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
        if (network === 'online') {
          db.replicate.to(remote, {
            doc_ids: [response.id],
            complete: function() {
              deferred.resolve(response);
            }
          });
        } else {
          deferred.resolve(response);
          cache.addDoc(response);
        }
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

        if (push) {
          db.replicate.to(remote, {
            doc_ids: [response.id],
            complete: function() {
              deferred.resolve(response.id);
            }
          });
        } else {
          deferred.resolve(response.id);
          cache.addDoc(response.id);
        }
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

    getRelatedDocuments: function(docId, documentType) {
      var deferred = $q.defer();

      documentType = typeof documentType !== 'undefined' ? documentType : 'LIKE';

      var queryOptions = {
        descending: true,
        include_docs: true
      };

      db.query(function(doc, emit) {
        if (doc.type === documentType && doc.posting === docId) {
          emit([doc.posting, 0], doc.created);
        }
      }, queryOptions, function(error, response) {
        deferred.resolve(response.rows);
      });

      return deferred.promise;
    },

    getUserDocuments: function(userId, documentTypes) {
      var deferred = $q.defer();

      documentTypes = typeof documentTypes !== 'undefined' ? documentTypes : 'uncategorized';

      // Set the query options
      var queryOptions = {
        descending: true,
        include_docs: true
      };

      db.query(function(doc, emit) {

        // if there is no type specified, get all docs
        if (documentTypes !== 'uncategorized') {

          // compare each type in the array with the current queried doc
          for (var i = 0; i < documentTypes.length; i++) {
            if (doc.type === documentTypes[i]) {

              // The POST type is kind of special because it relates to no other document
              if (doc.type === 'POST' && doc.user.id === userId) {
                emit([doc._id, i], doc.created);
              } else if (doc.type !== 'POST') {

                // Usually other types than POST relates to a POST object, so the key uses
                // the id of the related POST to create the custom key array
                emit([doc.posting, i], doc.created);
              }
              break;
            }
          }
        }
      }, queryOptions, function(error, response) {
        deferred.resolve(response.rows);
      });

      return deferred.promise;
    },

    /**
     * The getDocuments function is used to query a large amount of documents stored in the local
     * database. Additionally, the function "joins" together related data.
     * An array as parameter is used to define the types and "join order" of the queried documents.
     * An example array would look like ['POST', 'COMMENT', 'LIKE']. The function then queries the
     * database for this type.
     *
     * More on CouchDB Joins http://www.cmlenz.net/archives/2007/10/couchdb-joins
     *
     * @param  {array} documentTypes
     * @return {promise}
     */
    getDocuments: function(documentTypes) {
      var deferred = $q.defer();

      // Set value for documentTypes
      documentTypes = typeof documentTypes !== 'undefined' ? documentTypes : 'uncategorized';

      // Set the query options
      var queryOptions = {
        descending: true,
        include_docs: true
      };

      db.query(function(doc, emit) {

        // if there is no type specified, get all docs
        if (documentTypes === 'uncategorized') {
          emit([doc, 0], doc.created);
        } else {

          // compare each type in the array with the current queried doc
          for (var i = 0; i < documentTypes.length; i++) {
            if (doc.type === documentTypes[i]) {

              // The POST type is kind of special because it relates to no other document
              if (doc.type === 'POST') {
                emit([doc._id, i], doc.created);
              } else {

                // Usually other types than POST relates to a POST object, so the key uses
                // the id of the related POST to create the custom key array
                emit([doc.posting, i], doc.created);
              }
              break;
            }
          }
        }
      }, queryOptions, function(error, response) {
        deferred.resolve(response.rows);
      });

      return deferred.promise;
    },

    /**
     * This is another implementation of the pouchdb query method. It is possible to limit the amount
     * of returned documents and to define a startkey from which on the documents gets queried.
     * @param  {string} channel
     * @param  {int} numberOfPosts
     * @param  {timestamp} end
     * @return {promise}
     */
    getChannelStream: function(channel, numberOfPosts, end) {
      var deferred = $q.defer();

      // Set default parameter
      numberOfPosts = typeof numberOfPosts !== 'undefined' ? numberOfPosts : 50;
      end = typeof end !== 'undefined' ? end : [Date.now(), 0];
      channel = typeof channel !== 'undefined' ? channel : 'uncategorized';

      // Set query options
      var queryOptions = {
        descending: true,
        limit: numberOfPosts,
        include_docs: true,
        endkey: end
      };

      db.query(function(doc, emit) {
        if (doc.channel === channel) {
          emit([doc.created, 0], doc.created);
        }
      }, queryOptions, function(error, response) {
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
    }
  };
});