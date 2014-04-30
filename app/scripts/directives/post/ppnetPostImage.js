'use strict';

angular.module('PPnet')
  .directive('ppnetPostImage', function(ppSyncService) {
    return {
      restrict: 'E',
      template: '<img ng-src="{{loadedImage}}" ppnet-crop-image crop={{crop}} />',
      link: function(scope, element, attrs) {
        // Has the current post an attachment?
        if (!angular.isUndefined(scope.post.doc._attachments)) {

          if (attrs.crop === 'true') {
            scope.crop = true;
          }
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