'use strict';

angular.module('PPnet')
  .factory('ppnetUser', function() {

    // User Attributes that are saved to local storage
    var userAttributes = {
      id: '',
      name: '',
      provider: '',
      admin: false,
      online: false
    };

    var currentUser = userAttributes;

    // Initiliaze the Local Storage
    var initUser = function() {
      var retrievedObject = JSON.parse(localStorage.getItem('ppnetUser'));
      if (retrievedObject === null) {
        localStorage.setItem('ppnetUser', JSON.stringify(userAttributes));
      }
    };
    initUser();

    // Helper Function to save and retrieve the LocalStorage Data
    var loadCurrentUserFromLocalStorage = function() {
      currentUser = JSON.parse(localStorage.getItem('ppnetUser'));
    };

    var saveCurrentUsertoLocalStorage = function() {
      localStorage.setItem('ppnetUser', JSON.stringify(currentUser));
    };

    return {
      login: function(newUserData) {
        userAttributes = newUserData;
        userAttributes.online = true;
        userAttributes.admin = false;
        saveCurrentUsertoLocalStorage();
        return true;
      },
      logout: function() {
        currentUser = userAttributes;
        saveCurrentUsertoLocalStorage();
      },
      isLogedIn: function() {
        loadCurrentUserFromLocalStorage();
        return (currentUser.online) ? true : false;
      },
      isAdmin: function() {
        loadCurrentUserFromLocalStorage();
        return (currentUser.admin) ? true : false;
      },
      toggleAdmin: function(newStatus) {
        loadCurrentUserFromLocalStorage();
        currentUser.admin = newStatus;
        saveCurrentUsertoLocalStorage();
      },
      getUserData: function() {
        loadCurrentUserFromLocalStorage();
        return currentUser;
      },
      getName: function() {
        loadCurrentUserFromLocalStorage();
        return currentUser.name;
      },
      getId: function() {
        loadCurrentUserFromLocalStorage();
        return currentUser.id;
      }
    };

  });