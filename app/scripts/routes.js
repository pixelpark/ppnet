app.config(['$routeProvider',
  function($routeProvider) {

    $routeProvider.when('/posting', {
      controller: 'PostingController',
      templateUrl: 'views/posting.html'
    });

    $routeProvider.when('/hashtag/:hashtag', {
      controller: 'HashtagController',
      templateUrl: 'views/hashtag.html'
    });

    $routeProvider.when('/hashtag', {
      templateUrl: 'views/hashtag.html'
    });

    $routeProvider.when('/login', {
      templateUrl: 'views/login.html'
    });

    $routeProvider.when('/report', {
      controller: 'ReportController',
      templateUrl: 'views/report.html'
    });

    $routeProvider.when('/user/:task', {
      controller: 'UserController',
      template: ''
    });

    $routeProvider.when('/view/timeline', {
      controller: 'TimelineController',
      templateUrl: 'views/timeline.html'
    });

    $routeProvider.when('/view/map/:long/:lat/:zoom', {
      controller: 'MapController',
      templateUrl: 'views/map.html'
    });
    /*
    $routeProvider.when('/view/:view', {
      controller: 'ViewController',
      templateUrl: function(params) {
        return "views/" + params.view + '.html';
      }
    });
    */

    $routeProvider.otherwise({
      controller: 'PostingController',
      templateUrl: 'views/posting.html'
    });

  }
]);