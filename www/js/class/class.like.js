var scope, rootScope;

function Like($scope, id) {
  scope = $scope;
  if (typeof id != 'undefined')
    this.id = id;
  return this;
}

Like.prototype.load = function(doc) {
  console.log('Like.prototype.load');
  for (var i = 0; i <= scope.postings.length - 1; i++) {
    if (scope.postings[i].id == doc.id) {
      this.doc = scope.postings[i].doc;
      this.rev = (scope.postings[i].doc._rev) ? scope.postings[i].doc._rev : scope.postings[i].doc.rev;
      break;
    }
  }
  return this;
}

Like.prototype.create = function(posting) {
  console.log('Like.prototype.create');
  if (this.likeIsAlreadyExiting(posting)) {
    this.doc = {
      created: new Date().getTime(),
      posting: posting.id,
      user: {
        id: scope.user.getId(),
        name: scope.user.getName()
      },
      coords: {
        longitude: scope.coords.longitude,
        latitude: scope.coords.latitude,
        accuracy: scope.coords.accuracy,
      },
      type: 'LIKE'
    };
    return this.doc;
  }
}



Like.prototype.createToScope = function(doc) {
  console.log('Like.prototype.createToScope');
  if (this.likeIsAlreadyExiting(doc)) {
    scope.types[doc.id] = {
      type: 'LIKE',
      posting: doc.doc.posting
    };
    if (!scope.likes[doc.doc.posting])
      scope.likes[doc.doc.posting] = new Array();
    scope.likes[doc.doc.posting].push(doc);
    scope.apply();
  }

}

Like.prototype.delete = function(push) {
  if (typeof push == 'undefined') {
    push = 1;
  }
  console.log('Like.prototype.delete');
  scope.db.get(this.id, function(err, results) {
    scope.db.remove(results, function(err, results) {
      if (push) {
        scope.global_functions.toPush(results);
      }
    });
    this.deleteFromScope();
  });
};


Like.prototype.deleteFromScope = function() {
  console.log('Like.prototype.deleteFromScope');
  var this_id = this.id;
  if (scope.types[this_id]) {
    angular.forEach(scope.likes[scope.types[this_id].posting], function(value, key) {
      if (value.id == this_id) {
        scope.likes[scope.types[this_id].posting].splice(key, 1);
        scope.apply();
      }
    });
  }
}

Like.prototype.onChange = function(change) {
  console.log('Like.prototype.onChange');
  if (change.deleted) {
    if (scope.likes[scope.types[change.id].posting])
      this.deleteFromScope();
  } else {

    this.createToScope(change);
  }
}


Like.prototype.likeIsAlreadyExiting = function(doc) {
  console.log('Like.prototype.likeIsExiting');
  return_value = true;
  if (scope.likes[doc.doc.posting]) {
    angular.forEach(scope.likes[doc.doc.posting], function(row, key) {
      if (row.doc.user.id == doc.doc.user.id) {
        return_value = false;
      }
    });
  }
  return return_value;
}