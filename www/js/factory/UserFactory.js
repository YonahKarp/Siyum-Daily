"use strict";

angular.module('starter').factory('UserFactory', function ($http) {
  var baseUrl = 'http://104.131.8.27/mishna-api/User.class.php?';

  return {

    addNewUser: function (email, phone) {
      return $http.post(
        baseUrl +
        'method=' + 'signup' +
        '&email=' + email +
        '&phone=' + phone //+
        //'&selectedMishnaLanguage=' + selectedMishnaLanguage
      );
    },

    checkUserCredentials: function (phone) {
      return $http.post(
        baseUrl +
        'method=' + 'signin' +
        '&phone=' + phone
      );
    },

    storeUserPersonalSettings: function (id, learning, alert) {
      return $http.get(
        baseUrl+
          'method=' + 'storeSettings' +
          '&id=' + id +
          '&learning_selection=' + learning +
          '&alert_time=' + alert.toString()
      );
    },

    delete: function (id) {
      return $http.post(
        baseUrl +
        'method=' + 'delete' +
        '&data=' + id
      );
    }
  };
});
