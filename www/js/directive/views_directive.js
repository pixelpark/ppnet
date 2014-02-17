

app.directive('ppnetMashupImage', function($timeout){
    return {
        restrict: 'AE',
        template: ' ',
        scope: {
            posting: '=posting',
            couch: '=couch',
            db: '=db',
            images: '=images',
            cache:'=cache'
        },
        link: function(scope, element, attrs) {
            if(scope.posting.doc._attachments){
                var imgEl = angular.element('<img id="' + scope.posting.id + '"/>'),
                    img = scope.couch + '/' + scope.posting.id + '/image';
                if (scope.cache){
                    ImgCache.isCached(img, function(path, success){
                        var target = $('img#'+scope.posting.id);
                        element.append(imgEl.attr('src', img));

                        if(success){
                            ImgCache.useCachedFile(target);
                        }else{
                            ImgCache.cacheFile(target.attr('src'), function(){
                                ImgCache.useCachedFile(target);
                            }, function(){
                                element.append(imgEl.attr('src', scope.posting.temp_img));
                            });
                        }
                    });
                }else{
                    if(scope.posting.temp_img)
                        element.append(imgEl.attr('src', scope.posting.temp_img));
                    else
                        element.append(imgEl.attr('src', scope.posting.id));
                }
            }else{
                element.remove();
            }
        }
    };
});

app.directive('ppnetMashupItem', function($timeout) {
    return {
        restrict: 'AE',
        link: function(scope, element, attrs) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('MashupImagesLoaded');
                });
            }
            $(element).click(function () {
                $(this).toggleClass('highlight');
                $('.mashup_wrapper').isotope('reLayout');
            });
        }
    };
});