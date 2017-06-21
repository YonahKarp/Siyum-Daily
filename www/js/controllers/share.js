"use strict";

angular.module('starter').controller('ShareController', function (
  $scope,
  $ionicNavBarDelegate,
  $cordovaSocialSharing
) {

  $ionicNavBarDelegate.showBackButton(false);



  var message = "Check out this amazing new app.\n" +
      "Its called siyum daily. They give u a mishna or a few pesukim from tehillim. " +
      "And each person does his small part and collectively we make a siyum daily. " +
      "They finish every single day all of tehillim and mishnayos!";

  //add link
  if(ionic.Platform.isIOS()){
    message += "\nDownload: https://itunes.apple.com/us/app/siyum-daily/id1207674788/"
  }else{
    message += "\nDownload: http://bit.ly/2ge0ROT"
  }

  /**
   * Share Anywhere.
   **/
  $scope.shareAnywhere = function () {
    $cordovaSocialSharing.share('', 'Siyum Daily App', null, message);
  };

  /**
   * Share By Email.
   **/
  $scope.shareByEmail = function () {

    $cordovaSocialSharing
      .shareViaEmail(message, 'Siyum Daily App', '');
  };
  /**
   * Share By SMS.
   **/
  $scope.shareBySMS = function () {
    $cordovaSocialSharing.shareViaSMS(message, '');
  }
});
