'use strict';

angular.module('ppnetApp')
	.directive('ppnetPostImage', function(ppSyncService) {
		return {
			restrict: 'AE',
			link: function(scope, element, attrs) {
				// Has the current post an attachment?
				if (!angular.isUndefined(scope.post.doc._attachments)) {
					// Load the attachment from local database
					ppSyncService.getAttachment(scope.post.id, 'image').then(function(response) {
						var reader = new FileReader();

						reader.onload = function(e) {
							scope.loadedImage = e.target.result;
							element.attr('src', scope.loadedImage);

							if (attrs.crop === 'true') {

								scope.$watch(function() {
									return element.height();
								}, function(value) {
									//scope.height = element.height();
									if (value > 200 && attrs.crop === 'true') {
										var margin = (value - 200) / 2;
										element.css('margin-top', -margin);
									}
								});
							}
						};

						// Convert the BLOB to DataURL
						reader.readAsDataURL(response);
					});
				}
			}
		};
	});