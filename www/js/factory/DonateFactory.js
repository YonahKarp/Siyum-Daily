
"use strict";

angular.module('starter').factory('DonateFactory', function ($http) {
  var baseUrl = 'http://104.131.96.199/mishna-api/Stripe.class.php?';
  //var baseUrl = 'http://192.168.0.13/xampp/siyum-daily-mishna-api/Stripe.class.php?';


  return {
    pay: function (email, amount, token) {
      return $http.get(
        baseUrl +
        'method=' + 'donate' +
        '&email=' + email +
        '&token=' + token +
        '&amount=' + amount + '00'
      );
    },

    contactAdmin: function (email, option, amount, message) {
      return $http.post(
        baseUrl +
        'method=' + 'contact' +
        '&email=' + email +
        '&option=' + option +
        '&amount=' + amount +
        '&message=' + encodeURIComponent(message)
      );
    }
  };
});
