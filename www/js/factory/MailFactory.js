/**
 * Created by YonahKarp on 3/24/17.
 */
"use strict";

angular.module('starter').factory('MailFactory', function ($http) {
  var baseUrl = 'http://104.131.8.27/mishna-api/emailValidation/mailer.php?';

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
