"use strict";

angular.module('starter').factory('SettingsFactory', function ($http) {
  var baseUrl = 'http://104.131.96.199/mishna-api/User.class.php?';
  //var baseUrl = 'http://192.168.0.13/xampp/siyum-daily-mishna-api/User.class.php?';



  return {
    updateUserSettings: function (id, frequency, learningStatus, timezone) {
      return $http.post(
        baseUrl +
        'method=' + 'update' +
        '&userId=' + id +
        '&frequency=' + frequency +
        '&learningStatus=' + learningStatus
        //'&timezone=' + timezone
      );
    },

    getUserSettings: function (userId) {
      return $http.get(
        baseUrl +
        'method=' + 'getUserSettings' +
        '&data=' + userId
      );
    }
  };
});
