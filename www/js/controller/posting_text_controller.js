app.controller('PostingTextController', ['$scope', 'ppSyncService',
  function($scope, ppSyncService) {
    $scope.posting_functions = {};

    $scope.posting_functions.create = function() {
      var msg = document.getElementById('new-posting').value;
      if (!msg.length >= 1)
        return false;

      if (msg.match(/iamadmin/i)) {
        $scope.user.setAdmin(true);
        alert('Willkommen ADMIN');
        document.getElementById('new-posting').value = '';
        return false;
      }
      if (msg.match(/noadmin/i) && $scope.user.admin) {
        $scope.user.setAdmin(false);
        document.getElementById('new-posting').value = '';
        return false;
      }

      var posting = new Posting($scope);
      ppSyncService.post(posting.create(msg));
      document.getElementById('new-posting').value = '';
    };

  }
]);