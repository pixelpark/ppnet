'use strict';

angular.module('PPnet')
  .factory('ppnetPostHelper', function() {

    var defaultPost = {
      msg: '',
      created: false,
      user: false,
      type: 'POST'
    };
    var defaultLike = {
      created: false,
      user: false,
      type: 'LIKE',
      posting: false
    };
    var defaultComment = {
      msg: '',
      created: false,
      user: false,
      type: 'COMMENT',
      posting: false
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
        tempPost.user = {
          id: user.id,
          name: user.name
        };
        tempPost.msg = content;
        return tempPost;
      },
      createLikeObject: function(user, posting) {
        var tempLike = defaultLike;
        tempLike.created = new Date().getTime();
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
        tempComment.user = {
          id: user.id,
          name: user.name
        };
        tempComment.posting = posting;
        return tempComment;
      }
    };
  });