/**
 * Created by YonahKarp on 2/8/17.
 */
"use strict";

angular.module('starter').factory('TehillimFactory', function ($http) {
  var baseUrl = 'http://104.131.96.199/mishna-api/Tehillim.class.php?';
  //var baseUrl = 'http://192.168.0.13/xampp/siyum-daily-mishna-api/Tehillim.class.php?';


  return {
    randomTehillim: function (userId) {
      return $http.get(
        baseUrl +
        'method=' + 'random'
        + '&userId=' + userId
      );
    },

    getTehillim: function (tehillimId) {
      return $http.get(
        baseUrl +
        'method=' + 'get' +
        '&tehillimId=' + tehillimId
      );
    },

    regrabTehillim: function (userId) {
      return $http.get(
        baseUrl +
        'method=' + 'regrab' +
        '&userId=' + userId
      );
    },

    completeTehillim: function (userId, tehillimId) {
      return $http.post(
        baseUrl +
        'method=' + 'complete' +
        '&userId=' + userId +
        '&tehillimId=' + tehillimId
      );
    },

    getCycleStatus: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'getCycleStatus' +
        '&data=' + id
      )
    },


    setTehillimAssignDate: function (id) {
      return $http.post(
        baseUrl +
        'method=' + 'assignTehillimDate' +
        '&data=' + id
      );
    }
  };

});
