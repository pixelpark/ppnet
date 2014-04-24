'use strict';

angular.module('PPnet')
  .directive('ppnetMashupImage', function($timeout) {
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
        if (scope.posting.doc._attachments) {
          var imgEl = angular.element('<img id="' + scope.posting.id + '"/>'),
            img = scope.couch + '/' + scope.posting.id + '/image';
          if (scope.cache) {

            ImgCache.isCached(img, function(path, success) {

              if (success) {

                element.html('<img src="' + img + '" id="' + scope.posting.id + '"/>');
                var target = $('img#' + scope.posting.id);
                ImgCache.useCachedFile(target);

              } else {
                element.html('<img src="' + img + '" id="' + scope.posting.id + '"/>');
                var target = $('img#' + scope.posting.id);
                ImgCache.cacheFile(img, function() {
                  ImgCache.useCachedFile(target);
                }, function() {

                });
              }
            });
          } else {
            if (scope.posting.temp_img)
              element.append(imgEl.attr('src', scope.posting.temp_img));
            else
              element.append(imgEl.attr('src', img));
          }
        } else {
          element.remove();
        }
      }
    };
  });