var scope, rootScope;

function Posting($scope, id) {
    console.log('Posting');
    scope = $scope;
    if (typeof id != 'undefined')
        this.id = id;
    return this;
}

Posting.prototype.load = function(doc) {
    console.log('Posting.prototype.load');
    for (var i = 0; i <= scope.postings.length - 1; i++) {

        if (scope.postings[i].id == doc.id) {
            this.doc = scope.postings[i].doc;
            this.rev = (scope.postings[i].doc._rev) ? scope.postings[i].doc._rev : scope.postings[i].doc.rev;
            break;
        }
    }
    return this;
}

Posting.prototype.create = function(msg) {
    value = {
        created: new Date().getTime(),
        msg: msg,
        user: {
            id: scope.user.getId(),
            name: scope.user.getName()
        },
        coords: {
            longitude: scope.coords.longitude,
            latitude: scope.coords.latitude,
            accuracy: scope.coords.accuracy,
        },
        type: 'POST'
    };
    scope.db.post(value, function(err, response) {
        scope.global_functions.toPush(response);
    });
}



Posting.prototype.createToScope = function(doc) {
    console.log('Posting.prototype.createToScope');
    this.doc = doc.doc;
    this.created = (doc.created) ? doc.created : doc.doc.created;
    this.rev = (doc.doc._rev) ? doc.doc._rev : doc.doc.rev;

    if (doc.doc.image && !doc.doc._attachments) {
        console.log('KEIN BILD DA');
        return false;
    }
    if (doc.doc.image && doc.doc._attachments && typeof scope.images != 'undefined') {
        console.log('BILD DA');
        if (doc.doc.user.id == scope.user.getId() && scope.images[doc.id]) {
            this.temp_img = scope.images[doc.id];
        }
    }
    scope.types[doc.id] = {
        type: 'POST'
    };
    if (!scope.likes[doc.id]) {
        scope.likes[doc.id] = new Array();
    }
    if (!scope.comments[doc.id]) {
        scope.comments[doc.id] = new Array();
    }
    scope.postings.push(this);
    //return this;
}

Posting.prototype.delete = function() {
    console.log('Posting.prototype.delete');
    scope.db.get(this.id, function(err, results) {
        scope.db.remove(results, function(err, results) {
            pusher = new Array();
            pusher.push(results.id);
            if (scope.likes) {
                angular.forEach(scope.likes[results.id], function(value, key) {
                    new Like(scope, value.id).delete(0);
                    pusher.push(value.id);
                });
            } else {
                // TODO - Function do delete all Likes from DB

            }
            if (scope.comments) {
                angular.forEach(scope.comments[results.id], function(value, key) {
                    new Comment(scope, value.id).delete(0);
                    pusher.push(value.id);
                });
            } else {
                // TODO - Function do delete all Comments from DB

            }
            scope.global_functions.toPush(pusher);
        });
    });
};


Posting.prototype.deleteFromScope = function() {
    console.log('Posting.prototype.deleteFromScope');
    for (var i = 0; i <= scope.postings.length - 1; i++) {
        if (scope.postings[i].id == this.id) {
            scope.postings.splice(i, 1);
            break;
        }
    }
}

Posting.prototype.onChange = function(change) {
    console.log('Posting.prototype.onChange');
    if (change.deleted) {
        this.deleteFromScope();
    } else if (!scope.types[change.id]) {
        this.createToScope(change);
    }
    scope.apply();
}