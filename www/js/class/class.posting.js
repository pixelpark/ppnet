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
    console.log('Posting.prototype.create');
    this.doc = doc.doc;
    this.created = (doc.created) ? doc.created : doc.doc.created;
    //this.id = (doc.id) ? doc.id : doc.doc._id;
    this.rev = (doc.doc._rev) ? doc.doc._rev : doc.doc.rev;

    if (doc.doc.image && !doc.doc._attachments) {
        console.log('KEIN BILD DA');
        return false;
    }
    if (doc.doc.image && doc.doc._attachments && typeof scope.images != 'undefined') {
        console.log('BILD DA');
        console.log(scope.images);
        if (doc.doc.user.id == scope.user.getId() && scope.images[doc.id]) {
            console.log('c');
            this.temp_img = scope.images[doc.id];
            console.log('d');
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
    return this;
}

Posting.prototype.delete = function() {
    console.log('Posting.prototype.delete');
    scope.db.get(this.id, function(err, results) {
        scope.db.remove(results, function(err, results) {
            pusher = new Array();
            pusher.push(results.id);
            angular.forEach(scope.likes[results.id], function(value, key) {
                new Like(scope, value.id).delete(0);
                pusher.push(value.id);
            });

            angular.forEach(scope.comments[results.id], function(value, key) {
                new Comment(scope, value.id).delete(0);
                pusher.push(value.id);
            });
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
        //var posting = new Posting(scope, change.id);
        this.deleteFromScope();
    } else if (!scope.types[change.id]) {
        //var posting = new Posting($scope, change.id);
        var object = this.createToScope(change);
        if (object != false) {
            scope.postings.push(object);
        }
    }
    scope.apply();
}