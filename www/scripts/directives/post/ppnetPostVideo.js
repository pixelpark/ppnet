'use strict';

angular.module('PPnet')
  .directive('ppnetPostVideo', function() {
    return {
      restrict: 'AE',
      template: ' ',
      scope: {
        posting: '=posting',
        couch: '=couch',
        db: '=db',
        images: '=images',
        cache: '=cache'
      },
      link: function(scope, element, attrs) {
        if (scope.posting.doc._attachments && scope.posting.doc.video) {
          angular.forEach(scope.posting.doc._attachments, function(row, key) {
            element.html('<video width="320" height="240" controls>' + '<source src="' + scope.couch + '/' + scope.posting.id + '/' + key + '" type="' + row.content_type + '">' + 'Your browser does not support the video tag.' + '</video>');
          });

        }
      }
    };
  });