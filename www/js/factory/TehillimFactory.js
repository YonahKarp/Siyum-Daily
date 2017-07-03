/**
 * Created by YonahKarp on 2/8/17.
 */
"use strict";

angular.module('starter').factory('TehillimFactory', function ($http) {
  var baseUrl = 'http://104.131.96.199/mishna-api/Tehillim.class.php?';

  return {
    getRandomLearning: function (userId) {
      return $http.get(
        baseUrl +
        'method=' + 'random'
        + '&userId=' + userId
      );
    },

    completeLearning: function (userId, tehillimId) {
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


    setAssignDate: function (id) {
      return $http.post(
        baseUrl +
        'method=' + 'assignTehillimDate' +
        '&data=' + id
      );
    }
  };

});
