/**
 * Created by YonahKarp on 5/18/17.
 */
"use strict";

angular.module('starter').controller('AdminController', function (
  $scope, $rootScope,
  $state,
  $ionicPopup,
  $ionicHistory,
  $timeout,
  SponsorFactory
) {

  $ionicHistory.nextViewOptions({
    disableBack: true
  });

   $scope.sponsors = null;

  /**
   * We fetch all the Sponsor message with published status set to 1.
   */
  $scope.$on('$ionicView.beforeEnter', function () {

    getSponsorDataFromServer();

  });

  $scope.changeMessageStatus = function (sponsor) {

    var confirmPopup = $ionicPopup.confirm({
      title: 'set publish status',
      okText: 'published',
      cancelText: 'not published',
      template: sponsor.message + ' Change status to'
    });

    confirmPopup.then(function(res) {
      if (res) {
        SponsorFactory.setMessageStatus(sponsor.sponsor_id, 1).success(function (data) {
          document.getElementById("status"+sponsor.sponsor_id).innerHTML = "yes";
        });

        confirmPopup.close();
      } else {
        SponsorFactory.setMessageStatus(sponsor.sponsor_id, 0).success(function (data) {
          document.getElementById("status"+sponsor.sponsor_id).innerHTML = "no";
        });

        confirmPopup.close();
      }
    });
  };

  $scope.setMessage = function(sponsor){
    var showPopup = $ionicPopup.show({

      scope: $scope,
      title:'Change Message',
      template: '<textarea id = "message">' + sponsor.message +'</textarea>',
      buttons: [
        { text: 'DELETE',
          type: 'button-royal',
          onTap: function(e) {
            SponsorFactory.deleteMessage(sponsor.sponsor_id).success(function (data) {
              getSponsorDataFromServer();
            });

          }
        }, {
          text: '<b>set</b>',
          type: 'button-stable',
          onTap: function(e) {

            var newMessage = document.getElementById("message").value;
            document.getElementById("message"+sponsor.sponsor_id).innerHTML = newMessage;
            SponsorFactory.setMessage(sponsor.sponsor_id, newMessage)
          }
        }
      ]
    });

    showPopup.then(function (submitted) {});
  };

  function getSponsorDataFromServer() {
    SponsorFactory.getAllSponsorData().success(function (data) {
      $scope.sponsors = data;
    });

    $scope.$apply();
  }

});
