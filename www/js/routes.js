app.config(function($routeProvider, $locationProvider) {

	$routeProvider.when('/posting', {
      template: '123456',
      controller: ChapterCntl,
      controllerAs: 'chapter'
    });
    
    $routeProvider.when('/posting2', {
      templateUrl: '654321',
      controller: ChapterCntl,
      controllerAs: 'chapter'
    });
    
}); 

function ChapterCntl($routeParams) {
  this.name = "ChapterCntl";
  this.params = $routeParams;
}