var app = angular.module('PPnet',['ngSanitize','ngAnimate']);

app.controller('AppController', ['$scope', function($scope) {
//function AppController($scope) {
 	new Database($scope);
	new User($scope);
 	
 	$scope.db.changes({
					  since:  'latest',
					  continuous: true,
					  include_docs: true,
					  onChange:  function(change) {

					  }
	});
 	
	var QueryString = function () {
	  var query_string = {};
	  var query = window.location.search.substring(1);
	  var vars = query.split("&");
	  for (var i=0;i<vars.length;i++) {
	    var pair = vars[i].split("=");
	    if (typeof query_string[pair[0]] === "undefined") {
	      query_string[pair[0]] = pair[1];
	    } else if (typeof query_string[pair[0]] === "string") {
	      var arr = [ query_string[pair[0]], pair[1] ];
	      query_string[pair[0]] = arr;
	    } else {
	      query_string[pair[0]].push(pair[1]);
	    }
	  } 
	   return query_string;
	} ();
	
	
    $scope.header =[{ name: 'header.html', url: 'html/header.html'}];
    $scope.header = $scope.header[0];
    
    var template = { };
    template['login'] ={ name: 'login.html', url: 'html/login.html'};
    template['posting'] ={ name: 'posting.html', url: 'html/posting.html'};
    template['start'] ={ name: 'start.html', url: 'html/start.html'};

    $scope.footer =[{ name: 'footer.html', url: 'html/footer.html'}];
    $scope.footer = $scope.footer[0];
    
 	 
	if(!$scope.user.isLogedIn() && QueryString.page!='login'){
	 	$scope.template = template['login'];
	}else{
	 	$scope.template = (QueryString.page)?template[QueryString.page]:template['posting'];
	}
}]);