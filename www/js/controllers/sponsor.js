"use strict";

angular.module('starter').controller('SponsorController', function (
  $scope, $rootScope,
  $state,
  $timeout,
  $ionicHistory,
  SponsorFactory,
  UserService,
  $cordovaSQLite,
  NotificationService,
  $cordovaLocalNotification
) {
  $ionicHistory.nextViewOptions({
    disableBack: true
  });

  var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default' });


  /**
   * Will contains all the published Sponsor messages.
   */
  $scope.publishedSponsorMessages = null;

  $scope.redirect = function () {
    $state.go('signin');
  };

  $scope.goToMyMishna = function () {
    $state.go('app.mymishna');
  };

  $scope.goToSettings = function () {
    $state.go('app.settings');
  };

  $scope.goToMyTehillim = function () {
    $state.go('app.tehillim');
  };

  $scope.goToDonation = function () {
    $state.go('app.donate');
  };

  /**
   * We fetch all the Sponsor message with published status set to 1.
   */
  $scope.$on('$ionicView.beforeEnter', function () {

    cordova.plugins.notification.badge.set(0);



    //show/hide menu objects across app on startup
    var selected = UserService.getLearningSelection().split(",");
    $rootScope.showMishna = selected.indexOf("mishnayos") > -1;
    $rootScope.showTehillim = selected.indexOf("tehillim") > -1;

    $cordovaSQLite.execute(db, "SELECT email FROM user")
      .then(function(res){
        $rootScope.isAdmin = (
          res.rows.item(0).email == "karp.yoni@gmail.com"
          || res.rows.item(0).email == "mygroner@gmail.com"
          || res.rows.item(0).email == "eliatias88@gmail.com"
          || res.rows.item(0).email == "sdgroner@gmail.com");
      });

    //split sponsor messages into groups
    $scope.messagesInHonor = [];
    $scope.messagesInMemory = [];
    $scope.messagesAsZchus = [];

    $cordovaSQLite.execute(db, "SELECT julianDay('now') - julianDay(last_sponsor_update) as dateDiff FROM user")
      .then(function(res) {

        //We only check the server once a day for new sponsor data
        if (res.rows.item(0).dateDiff >= 1) {

          getSponsorsFromServer();

        }else {
          getSponsorsFromStorage();
        }
      });
  });

  $scope.getSponsorsFromServer = function () {
    getSponsorsFromServer();
  };

  function getSponsorsFromServer() {

    $scope.messagesInHonor = [];
    $scope.messagesInMemory = [];
    $scope.messagesAsZchus = [];

    SponsorFactory.getPublishedSponsorMessages().success(function (data) {

      $cordovaSQLite.execute(db, "UPDATE user SET last_sponsor_update = julianDay('now')");
      $cordovaSQLite.execute(db, "DELETE FROM Sponsor");

      data.forEach(function(sponsor){
        $cordovaSQLite.execute(db, "INSERT INTO Sponsor(message) VALUES('"+sponsor.message.replace("'","''")+"')").then(function () {});

        if(sponsor.message.indexOf("In honor") === 0)
          $scope.messagesInHonor.push(sponsor.message.substring(12));//remove "In honor of " (12 letters long)
        if(sponsor.message.indexOf("In memory") === 0)
          $scope.messagesInMemory.push(sponsor.message.substring(13));//remove "In memory of " (13 letters long)
        if(sponsor.message.indexOf("As a") === 0)
          $scope.messagesAsZchus.push(sponsor.message.substring(14));//remove "As a zcus for " (14 letters long)

      });
    });

    $scope.$apply();
  }

  function getSponsorsFromStorage() {
    $cordovaSQLite.execute(db, "SELECT message FROM Sponsor").then(function (res) {

      for (var i = 0; i < res.rows.length; i++) {
        var msg = (res.rows.item(i).message);

        if(msg.indexOf("In honor") === 0)
          $scope.messagesInHonor.push(msg.substring(12));//remove "In honor of " (12 letters long)
        if(msg.indexOf("In memory") === 0)
          $scope.messagesInMemory.push(msg.substring(13));//remove "In memory of " (13 letters long)
        if(msg.indexOf("As a") === 0)
          $scope.messagesAsZchus.push(msg.substring(14));//remove "As a zcus for " (14 letters long)
      }
    });
    $scope.$apply();
  }

});
