var scope, rootScope;

function Comment($scope, doc) {
  console.log('Comment');
  scope = $scope;
  if (typeof doc != 'undefined') {
    this.id = doc.id;
    this._id = doc.id;
    this._rev = doc.doc._rev;
  }
  return this;
}

Comment.prototype.load = function(doc) {
  console.log('Comment.prototype.load');
}

Comment.prototype.create = function(posting, comment) {
  console.log('Comment.prototype.create');

  if (!comment.length >= 1)
    return false;

  this.doc = {
    created: new Date().getTime(),
    posting: posting.id,
    msg: comment,
    user: {
      id: scope.user.getId(),
      name: scope.user.getName()
    },
    coords: {
      longitude: scope.coords.longitude,
      latitude: scope.coords.latitude,
      accuracy: scope.coords.accuracy,
    },
    type: 'COMMENT'
  };

  return this.doc;

}



Comment.prototype.createToScope = function(doc) {
  console.log('Comment.prototype.createToScope');
  scope.types[doc.id] = {
    type: 'COMMENT',
    posting: doc.doc.posting
  };
  if (!scope.comments[doc.doc.posting])
    scope.comments[doc.doc.posting] = new Array();
  scope.comments[doc.doc.posting].push(doc);
  scope.apply();
}

Comment.prototype.delete = function(push) {
  console.log('Comment.prototype.delete');
  this.deleteFromScope();
  return this;
};


Comment.prototype.deleteFromScope = function() {
  console.log('Comment.prototype.deleteFromScope');
  var this_id = this.id;
  angular.forEach(scope.comments[scope.types[this_id].posting], function(value, key) {
    if (value.id == this_id) {
      scope.comments[scope.types[this_id].posting].splice(key, 1);
      scope.apply();
    }
  });
}

Comment.prototype.onChange = function(change) {
  console.log('Comment.prototype.onChange');
  if (change.deleted) {
    this.deleteFromScope();
  } else {
    this.createToScope(change);
  }
}