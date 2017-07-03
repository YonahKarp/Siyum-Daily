"use strict";

angular.module('starter').factory('MishnaFactory', function (
  $http, $cordovaSQLite
) {
  var baseUrl = 'http://104.131.96.199/mishna-api/Mishna.class.php?';

  return {
    getRandomLearning: function (userId) {
      return $http.get(
        baseUrl +
        'method=' + 'random'
        + '&userId=' + userId
      );
    },

    completeLearning: function (userId, mishnaId) {
      return $http.post(
        baseUrl +
        'method=' + 'complete' +
        '&userId=' + userId +
        '&mishnaId=' + mishnaId
      );
    },

    getCycleStatus: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'getCycleStatus' +
        '&data=' + id
      )
    },

    setAssignDate: function (id) {
      return $http.post(
        baseUrl +
        'method=' + 'assignMishnaDate' +
        '&data=' + id
      );
    }
  };

});
