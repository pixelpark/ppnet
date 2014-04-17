var scope, rootScope;

function Report($scope, doc) {
  console.log('Report');
  scope = $scope;
  if (typeof doc != 'undefined') {
    this.id = doc.id;
    if (doc.doc.posting)
      this.posting = doc.doc.posting.id;
    this._id = doc.id;
    this._rev = doc.doc._rev;
  }
  console.log(this);
  return this;
}


Report.prototype.create = function(posting) {
  console.log(posting);
  console.log('Report.prototype.create');
  this.doc = {
    created: new Date().getTime(),
    posting: {
      id: posting.id,

      doc: {
        created: posting.doc.created,
        _rev: posting._rev,
        msg: posting.doc.msg
      },
      user: {
        id: posting.doc.user.id,
        name: posting.doc.user.name,
      }
    },
    user: {
      id: scope.user.getId(),
      name: scope.user.getName()
    },
    type: 'REPORT'
  };
  return this.doc;
};

Report.prototype.createToScope = function(doc) {
  console.log('Report.prototype.createToScope');

  if (!scope.types[doc.id]) {
    scope.types[doc.id] = new Array();
  }

  scope.types[doc.id] = {
    type: 'REPORT'
  };
  scope.reports.push(doc);
  scope.apply();
  console.log(scope.reports.length);
}


Report.prototype.delete = function() {
  console.log('Report.prototype.delete');
  return this.deleteFromScope();
};

Report.prototype.deleteFromScope = function() {
  console.log('Report.prototype.deleteFromScope');

  var splice = new Array();
  for (var i = scope.reports.length - 1; i >= 0; i--) {
    if (scope.reports[i].doc.posting.id == this.posting) {
      scope.reports.splice(i, 1);
    }
  }
}

Report.prototype.onChange = function(change) {
  console.log('Report.prototype.onChange');
  console.log(change);
  if (change.deleted) {
    this.deleteFromScope();
  } else if (!scope.types[change.id]) {
    this.createToScope(change);
  }
  scope.apply();
}