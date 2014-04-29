'use strict';

angular.module('PPnet')
  .directive('ppnetPostImage', function(ppSyncService) {
    return {
      restrict: 'E',
      template: '<div class="post-image" ng-show="loadedImage"><img src="{{loadedImage}}" /></div>',
      link: function(scope) {
        // Has the current post an attachment?
        if (!angular.isUndefined(scope.post.doc._attachments)) {

          // Load the attachment from local database
          ppSyncService.getAttachment(scope.post.id, 'image').then(function(response) {
            var reader = new FileReader();

            reader.onload = function(e) {
              scope.loadedImage = e.target.result;
            };

            // Convert the BLOB to DataURL
            reader.readAsDataURL(response);
          });
        }
      }
    };
  });