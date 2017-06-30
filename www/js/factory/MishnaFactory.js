"use strict";

angular.module('starter').factory('MishnaFactory', function (
  $http, $cordovaSQLite
) {
  var baseUrl = 'http://104.131.96.199/mishna-api/Mishna.class.php?';

  return {
    randomMishna: function (userId) {
      return $http.get(
        baseUrl +
        'method=' + 'random'
        + '&userId=' + userId
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

    getCycleStatus: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'getCycleStatus' +
        '&data=' + id
      )
    },

    setMishnaAssignDate: function (id) {
      return $http.post(
        baseUrl +
        'method=' + 'assignMishnaDate' +
        '&data=' + id
      );
    }
  };

});
