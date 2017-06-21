/**
 * Created by YonahKarp on 3/24/17.
 */
"use strict";

angular.module('starter').factory('MailFactory', function ($http) {
  var baseUrl = 'http://104.131.96.199/mishna-api/emailValidation/mailer.php?';
  //var baseUrl = 'http://192.168.0.13/xampp/siyum-daily-mishna-api/Admin.class.php?';


  return {
    mailTo: function (email,code) {
      return $http.get(
        baseUrl +
        'emailto=' + email +
        '&code=' + code
      );
    }
  };
});
