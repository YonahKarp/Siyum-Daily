"use strict";

angular.module('starter').factory('AdminFactory', function ($http) {
  var baseUrl = 'http://104.131.8.27/mishna-api/Admin.class.php?';
  //var baseUrl = 'http://192.168.0.13/xampp/siyum-daily-mishna-api/Admin.class.php?';


  return {

    getCyclePeriod: function () {
      return $http.get(
        baseUrl +
        'method=' + 'getCyclePeriod'
      )
    },

      getCyclePeriodAndStatus: function (id) {
        return $http.get(
          baseUrl +
          'method=' + 'getCyclePeriodAndStatus' +
          '&id=' + id

        );
    },

    getStatInfo: function () {
      return $http.get(
        baseUrl +
        'method=' + 'getStatInfo'
      );
    }
  };
});
