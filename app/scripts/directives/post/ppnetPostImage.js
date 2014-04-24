'use strict';

angular.module('PPnet')
  .directive('ppnetPostImage', function(ppSyncService) {
    return {
      restrict: 'AE',
      template: ' ',
      scope: {
        posting: '=posting',
        images: '=images',
        cache: '=cache'
      },
      link: function(scope, element, attrs) {

        couch = ppSyncService.getRemoteUrl();
        if (scope.posting.doc.image) {
          var image = new Image(scope, scope.posting);
          element.html(image.doc.msg);
          image.loadImage(ppSyncService.getRemoteUrl() + '/' + image.id + '/image');
        } else {
          element.remove();
        }
        setTimeout(function() {
          $('a.magnific-popup').magnificPopup({
            type: 'image',
            closeOnContentClick: true,
            closeBtnInside: true
          });
        }, 1);
      }
    };
  });