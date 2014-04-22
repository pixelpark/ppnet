'use strict';

angular.module('PPnet')
  .factory('ppnetPostHelper', function($q) {
    return {
      saveComment: function(comments, newEntry) {
        return comments.push(newEntry);
      }
    }
  });