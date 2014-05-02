'use strict';

angular.module('PPnet')
  .service('global_functions', function() {

    this.showTimestamp = function(timestamp) {
      // Set the maximum time difference for showing the date
      var maxTimeDifferenceForToday = Math.round((new Date()).getTime() / 1000) - this.ageOfDayInSeconds();
      var maxTimeDifferenceForYesterday = maxTimeDifferenceForToday - 86400;
      var postTime = timestamp / 1000;
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
      if (item.created) {
        return item.created;
      } else if (item.doc.created) {
        return item.doc.created;
      }
    };

    this.isDeletable = function(item, user_id) {
      if (item.doc.user.id === user_id) {
        return true;
      }
      return false;
    };
  });