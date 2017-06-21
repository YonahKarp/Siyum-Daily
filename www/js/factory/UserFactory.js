"use strict";

angular.module('starter').factory('UserFactory', function ($http) {
  var baseUrl = 'http://104.131.96.199/mishna-api/User.class.php?';

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

    getUserInformations: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'getUser' +
        '&data=' + id
      );
    },

    getLastLoginDate: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'getLastLogin' +
        '&data=' + id
      );
    },

    getToggleStatus: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'getToggle' +
        '&data=' + id
      );
    },

    getLastAssignedMishnaDate: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'getLastAssignedMishna' +
        '&data=' + id
      );
    },

    getLastCompletedMishnaDate: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'getLastCompletedMishna' +
        '&data=' + id
      );
    },

    delete: function (id) {
      return $http.post(
        baseUrl +
        'method=' + 'delete' +
        '&data=' + id
      );
    },

    getInactive: function () {
      return $http.get(
        baseUrl +
        'method=' + 'getInactive'
      );
    },

    setAccountStatusToInactive: function (id) {
      return $http.post(
        baseUrl +
        'method=' + 'inactive' +
        '&data=' + id
      );
    },

    getAccountStatus: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'getAccountStatus' +
        '&data=' + id
      );
    },

    resetAccount: function (id) {
      return $http.post(
        baseUrl +
        'method=' + 'reset' +
        '&data=' + id
      );
    }
  };
});
