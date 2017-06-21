"use strict";

angular.module('starter').factory('MishnaFactory', function (
  $http, $cordovaSQLite
) {
  var baseUrl = 'http://104.131.96.199/mishna-api/Mishna.class.php?';
  //var baseUrl = 'http://192.168.0.13/xampp/siyum-daily-mishna-api/Mishna.class.php?';

  return {
    randomMishna: function (userId) {
      return $http.get(
        baseUrl +
        'method=' + 'random'
        + '&userId=' + userId
      );
    },

    getMishna: function (mishnaId) {
      return $http.get(
        baseUrl +
        'method=' + 'get' +
        '&mishnaId=' + mishnaId
      );
    },

    regrabMishna: function (userId) {
      return $http.get(
        baseUrl +
        'method=' + 'regrab' +
        '&userId=' + userId
      );
    },

    completeMishna: function (userId, mishnaId) {
      return $http.post(
        baseUrl +
        'method=' + 'complete' +
        '&userId=' + userId +
        '&mishnaId=' + mishnaId
        //+ '&mishnaFrom=' + mishnaFrom
      );
    },

    getCompletedMishna: function (userId) {
      return $http.get(
        baseUrl +
        'method=' + 'getCompletedMishna' +
        '&userId=' + userId
      );
    },

    resetMishna: function () {
      return $http.post(
        baseUrl +
        'method=' + 'reset'
      );
    },

    getCycleStatus: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'getCycleStatus' +
        '&data=' + id
      )
    },

    resetCycleStatus: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'resetCycleStatus' +
        '&data=' + id
      );
    },

    setMishnaAssignDate: function (id) {
      return $http.post(
        baseUrl +
        'method=' + 'assignMishnaDate' +
        '&data=' + id
      );
    },

    getCommentary: function(id){
      return $http.post(
        baseUrl +
        'method=' + 'getCommentary' +
        '&data=' + id
      );
    }
  };

});
