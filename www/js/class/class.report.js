var scope, rootScope;

function Report($scope, doc) {
    console.log('Report');
    scope = $scope;
    if (typeof doc != 'undefined') {
        this.id = doc.id;
        this.reportid = doc.reportid;
    }

    return this;
}


Report.prototype.create = function(posting_id) {
    console.log('Report.prototype.create');
    doc = {
        created: new Date().getTime(),
        posting: posting_id,
        user: {
            id: scope.user.getId(),
            name: scope.user.getName()
        },
        type: 'REPORT'
    };
    scope.db.post(doc, function(err, response) {
        scope.global_functions.toPush(response);
    });
};

Report.prototype.createToScope = function(doc) {
    console.log('Report.prototype.createToScope');
    scope.db.get(doc.doc.posting, function(err, results) {

        if (err) {
            console.log(err);
            doc.reportid = doc.id;
            new Report(scope, doc).delete();
        } else {
            val = new Array();
            val.id = results._id;
            val.doc = new Array();
            val.doc = results;
            val.reportby = new Array();
            val.reportby = doc.doc.user;
            val.reporttime = doc.doc.created;
            val.reportid = doc.id;
            if (!scope.types[doc.id]) {
                scope.types[doc.id] = new Array();
            }
            scope.types[doc.id] = {
                type: 'REPORT'
            };
            scope.reports.push(val);
            scope.apply();
        }
    });
}


Report.prototype.delete = function() {
    console.log('Report.prototype.delete');
    scope.db.get(this.reportid, function(err, results) {
        scope.db.remove(results, function(err, results) {
            scope.global_functions.toPush(results);
        });

    });
    this.deleteFromScope();
};

Report.prototype.deletePosting = function() {
    console.log('Report.prototype.deletePosting');
    scope.db.get(this.id, function(err, results) {
        scope.db.remove(results, function(err, results) {
            scope.global_functions.toPush(results);
        });
    });
}


Report.prototype.deleteFromScope = function() {
    console.log('Report.prototype.deleteFromScope');
    for (var i = 0; i <= scope.reports.length - 1; i++) {
        console.log(scope.reports[i].id + '==' + this.id);
        if (scope.reports[i].reportid == this.id) {
            scope.reports.splice(i, 1);
            break;
        }
    }
}

Report.prototype.onChange = function(change) {
    console.log('Report.prototype.onChange');
    if (change.deleted) {
        this.deleteFromScope();
    } else if (!scope.types[change.id]) {
        this.createToScope(change);
    }
    scope.apply();
}