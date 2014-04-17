app.directive('ppnetMenu', function() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/menu.html'
  };
});

app.directive('ppnetMenuMobile', function() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/menu_mobile.html'
  };
});

app.directive('ppnetHeader', function() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/header.html'
  };
});

app.directive('ppnetFooter', function() {
  return {
    restrict: 'E',
    templateUrl: 'views/partials/footer.html'
  };
});

app.directive('ppnetPostingActions', function() {
  return {
    restrict: 'C',
    templateUrl: 'views/partials/posting_actions.html'
  };
});