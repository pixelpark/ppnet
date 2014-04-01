/*
     $scope.global_functions.showLoader = function(item) {
            if ($scope.reports.length >= 1) {
                return false;
            }
            return true;
        };

        $scope.global_functions.orderByCreated = function(item) {
            if (item.created)
                return item.created;
            else
                return item.doc.created;
        };

        $scope.global_functions.isDeletable = function(item) {
            if (item.doc.user.id == $scope.user.getId())
                return true;
            return false;
        };

        $scope.time = function(timestamp) {
            timestamp = timestamp / 1000;
            return timestamp;
        };
        $scope.posting_functions.showTimestamp = function(posting) {
            // Set the maximum time difference for showing the date
            maxTimeDifferenceForToday = Math.round((new Date()).getTime() / 1000) - ageOfDayInSeconds();
            maxTimeDifferenceForYesterday = maxTimeDifferenceForToday - 86400;
            postTime = posting.doc.created / 1000;
            if ((postTime > maxTimeDifferenceForYesterday) && (postTime < maxTimeDifferenceForToday)) {
                return 'yesterday';
            } else if (postTime < maxTimeDifferenceForToday) {
                return 'older';
            }
            return 'today';
        };

        function ageOfDayInSeconds() {
            // Calculate beginning of the current day in seconds
            current_date = new Date();
            current_day_hours = current_date.getHours();
            current_day_minutes = current_date.getMinutes();
            return (current_day_hours * 60 * 60) + (current_day_minutes * 60);
        };

        $scope.apply = function() {
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        };

*/
app.service('global_functions', function() {
  this.showTimestamp = function(timestamp) {
    // Set the maximum time difference for showing the date
    maxTimeDifferenceForToday = Math.round((new Date()).getTime() / 1000) - this.ageOfDayInSeconds();
    maxTimeDifferenceForYesterday = maxTimeDifferenceForToday - 86400;
    postTime = timestamp / 1000;
    if ((postTime > maxTimeDifferenceForYesterday) && (postTime < maxTimeDifferenceForToday)) {
      return 'yesterday';
    } else if (postTime < maxTimeDifferenceForToday) {
      return 'older';
    }
    return 'today';
  };

  this.time = function(timestamp) {
    timestamp = timestamp / 1000;
    return timestamp;
  };


  this.ageOfDayInSeconds = function() {
    var dt = new Date();
    return dt.getSeconds() + (60 * dt.getMinutes()) + (60 * 60 * dt.getHours());
  };

  this.apply = function(scope) {
    if (!scope.$$phase) {
      scope.$apply();
    }
  };

  this.showLoader = function(items) {
    if (items.length >= 1) {
      return false;
    }
    return true;
  };

  this.orderByCreated = function(item) {
    if (item.created)
      return item.created;
    else if (item.doc.created)
      return item.doc.created;
  };

  this.isDeletable = function(item, user_id) {
    if (item.doc.user.id == user_id)
      return true;
    return false;
  };
});