"use strict";

angular.module('starter').factory('SponsorFactory', function ($http) {
  var baseUrl = 'http://104.131.96.199/mishna-api/Sponsor.class.php?';
  //var baseUrl = 'http://192.168.0.13/xampp/siyum-daily-mishna-api/Sponsor.class.php?';


  return {
    getRandMessageOne: function () {
      return $http.get(
        baseUrl +
        'method=' + 'random'
      );
    },

    postFreeMessage: function (email, message) {
      return $http.get(
        'http://104.131.96.199/mishna-api/Stripe.class.php?' +
        'method=contact' +
          '&email=' + email +
          '&option=free100' +
          '&amount=0'+
          '&message='+message
      );
    },


    getPublishedSponsorMessages: function () {
      return $http.get(
        baseUrl +
        'method=' + 'getSponsorMessages'
      );
    },

    getAllSponsorData: function () {
      return $http.get(
        baseUrl +
        'method=' + 'getAllSponsorData'
      );
    },

    setMessageStatus: function (id, status) {
      return $http.get(
        baseUrl +
        'method=' + 'setMessageStatus'+
          '&id=' + id +
          '&status=' + status
      );
    },

    setMessage: function (id, msg) {
      return $http.get(
        baseUrl +
        'method=' + 'setMessageText'+
        '&id=' + id +
        '&message=' + msg
      );
    },

    deleteMessage: function (id) {
      return $http.get(
        baseUrl +
        'method=' + 'deleteMessage'+
        '&id=' + id
      );
    }
  };
});
