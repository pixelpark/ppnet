'use strict';

angular.module('PPnet')
  .config(function(ppSyncServiceProvider) {

    /* Database Settings */
    ppSyncServiceProvider.setDBname('pixelpark_dev');
    ppSyncServiceProvider.setRemote('http://couchdb.simple-url.com:5984/');

  });