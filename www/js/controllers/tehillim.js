/**
 * Created by YonahKarp on 2/8/17.
 */
"use strict";

angular.module('starter').controller('TehillimController', function (
  $scope,
  $state,
  $ionicPopup,
  $ionicModal,
  $rootScope,
  $ionicNavBarDelegate,
  $ionicSlideBoxDelegate,
  $ionicSideMenuDelegate,
  $ionicScrollDelegate,
  $cordovaLocalNotification,
  TehillimFactory,
  UserFactory,
  AdminFactory,
  SettingsFactory,
  SettingsService,
  UserService,
  $cordovaSQLite
) {
  $ionicNavBarDelegate.showBackButton(false);
  $scope.viewtitle = '<span class="view-title">' + ' תהלים daily' + '</span><br><span class="view-subtitle"> - ' + 'Yeshiva Ateres Shimon' + '</span>';
  $scope.learningView = "tehillimView";


  $scope.completed = false;
  $rootScope.showCommentary = '';
  $rootScope.commentaryTitle = "Commentary";

  $scope.table ='תהלים';

  var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default'});

  /**
   * Will return to the view the number of days left for the next Tehillim update.
   * And will see if tehillim needs to be updated
   */
  $scope.getCycleDay = function () {

    $cordovaSQLite.execute(db, "SELECT _id, tehillim_id, julianDay(next_cycle_date) -  julianDay('now') as dateDiff FROM user")
      .then(function(res){

         $scope.cycleDays = Math.ceil(parseFloat(res.rows.item(0).dateDiff)  + 0.5);

          if(res.rows.item(0).dateDiff <=  -0.5){

            AdminFactory.getCyclePeriodAndStatus(res.rows.item(0)._id).success(function (data) {

              $cordovaSQLite.execute(db, "UPDATE user SET next_cycle_date = '"+data.nextDate+"'");
              setCycleDay();

              if (data.tehillimUpdate) { //if tehillim needs update, set mishna as well to -1 so it updates when requested
                $cordovaSQLite.execute(db, "UPDATE user SET mishna_id = -1");
                $scope.getAnotherTehillim();

              }
              else {
                if(parseInt(res.rows.item(0).tehillim_id) != -1)
                  $scope.showAlert("Retrieval error","sorry, it seems your clock is not set correctly");
                rebuildTehillim(res.rows.item(0).tehillim_id)
              }
            }).error(function () {
              $scope.showAlert("Retrieval error","Please connect to the internet to update your tehillim");
            });
          }else{
            rebuildTehillim(res.rows.item(0).tehillim_id)
          }
        });
  };

  function setCycleDay() {
    $cordovaSQLite.execute(db, "SELECT julianDay(next_cycle_date) -  julianDay('now') as dateDiff FROM user")
      .then(function (res) {
        $scope.cycleDays = Math.ceil(parseFloat(res.rows.item(0).dateDiff)+ 0.5);
      });
  }

  /**
   * When the user finished to learn the affected Tehillim.
   **/

  $scope.markAsCompleted = function () {

    $cordovaSQLite.execute(db, "SELECT last_completed_tehillim_date, date('now', 'localtime') as now FROM user")
      .then(function(res){
          var completedDate = res.rows.item(0).last_completed_tehillim_date;

          if(res.rows.item(0).now !=  completedDate) {
            launchPopup();
          }else{
            $scope.showAlert("Already completed", "Great job, you already completed your perek today (" + completedDate + ") \n Help make a siyum again by finishing your perek tomorrow as well!");
            $scope.completed = true;
          }
      });
  };

  function launchPopup() {

    if($scope.showCompleteTip < 2) {
      $cordovaSQLite.execute(db, "UPDATE toolTip SET completeTip = completeTip + 1");
      $scope.showCompleteTip += 1;
    }

    var confirmPopup = $ionicPopup.confirm({
      title: 'Mazel Tov!',
      template: '<img class="center" src="img/mishna-trophy.png" width="150" height="150">' +
      '<p>We will give you another Perek at the next cycle period, please don\'t forget the "completed" button in order to stay as an active user!</p>',
      cancelText: "undo"
    });

    confirmPopup.then(function (completed) {

      $scope.disableCompleteButton = true;
      if (completed) {

        $cordovaSQLite.execute(db, "SELECT _id, tehillim_id FROM user")
          .then(function(res){

            var tehillimId = res.rows.item(0).tehillim_id;
            var userId = res.rows.item(0)._id;

            TehillimFactory.completeTehillim(userId, tehillimId).success(function (data) {
              var result = data.status;
              if (result === "complete_tehillim_success") {

                var query = "UPDATE user SET last_completed_tehillim_date = date('now','localtime')";
                $cordovaSQLite.execute(db, query);
                query = "UPDATE user SET total_tehillim_completed = total_tehillim_completed + 1";
                $cordovaSQLite.execute(db, query);

                $scope.completed = true;
                updateReminder();

                if (!$scope.$$phase)
                  $scope.$digest();


              } else
                $scope.showAlert("Internal error", "Sorry unable to complete this Perek");
            }).error(function () {
              $scope.showAlert("Network error", "Please connect to the internet before completing the Tehillim");

            });
          });
      }else
        $scope.showAlert("Ok", "The perek was not marked as complete");

      $scope.disableCompleteButton = false;
    });
  }


  $scope.getAnotherTehillim = function () {

    $cordovaSQLite.execute(db, "SELECT _id FROM user")
      .then(function(res) {
        var userId = res.rows.item(0)._id;

        TehillimFactory.randomTehillim(userId).success(function (data) {


          $scope.tehillimId = data.tehillim_id;

          rebuildTehillim(data.tehillim_id);

          //handle data locally
          $cordovaSQLite.execute(db, "UPDATE user SET tehillim_id = " + data.tehillim_id);

          //Set the date of the last assigned Tehillim.
          TehillimFactory.setTehillimAssignDate(userId);

        });
      });
  };

  $scope.getContext = function (direction) {

    if($scope.showReferenceTip < 5){
      $cordovaSQLite.execute(db, "UPDATE toolTip SET referenceTip = referenceTip + 1");
      $scope.showReferenceTip += 1;

      $scope.showAlert("Please Note", "You are committed to only one Mishna or perk of tehillim. <br> The arrows are only for further personal study.<br> (Message will show " +
        (5-$scope.showReferenceTip)+ " more times) ");
    }

    var query = "SELECT _id, chapterLetter, hebrew, english FROM tehillim WHERE _id = "+(parseInt($scope.tehillimId) + direction);

    $cordovaSQLite.execute(db, query)
      .then(function(res){
          $scope.hebrew = '';

          $scope.tehillimId = res.rows.item(0)._id;
          $scope.title = "chapter: " + res.rows.item(0).chapterLetter;

          $scope.hebrewContext = res.rows.item(0).hebrew;
          $scope.english = res.rows.item(0).english.replace(/<.{1,3}>/g, '');
        });

  };

  $scope.backToLearning = function () {
    $cordovaSQLite.execute(db, "SELECT tehillim_id FROM user")
      .then(function(res){
          rebuildTehillim(res.rows.item(0).tehillim_id);
          $scope.updateCommentary();
      });
  };

  var rebuildTehillim = function (tehillimId) {

    if(parseInt(tehillimId) == -1) {

      $scope.getAnotherTehillim();
      return
    }

    $cordovaSQLite.execute(db, "SELECT _id, chapterLetter, hebrew, english FROM tehillim WHERE _id = "+ parseInt(tehillimId))
      .then(function(res){

          $scope.tehillimId = res.rows.item(0)._id;
          $scope.title = "chapter: "+ res.rows.item(0).chapterLetter;
          $scope.hebrew = res.rows.item(0).hebrew;
          $scope.english = res.rows.item(0).english.replace(/<.{1,3}>/g, '');

          $scope.hebrewContext = '';
        });
  };


  $scope.goToSettings = function () {
    $state.go('app.settings');
  };

  $scope.showAlert = function (title, msg) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: msg
    });
  };

  /**
   Refresh
   */
  $scope.doRefresh = function() {

    $cordovaSQLite.execute(db, "SELECT _id, tehillim_id FROM user")
      .then(function(res) {
        var userId = res.rows.item(0)._id;
        var tehillim_id = res.rows.item(0).tehillim_id;

        AdminFactory.getCyclePeriodAndStatus(userId).success(function (data) {
          //$scope.cycleDays = data.nextDate;
          $cordovaSQLite.execute(db, "UPDATE user SET next_cycle_date = '"+data.nextDate+"'");
          setCycleDay();


          if (data.tehillimUpdate)
            $scope.getAnotherTehillim();
          else {
            rebuildTehillim(tehillim_id);
          }
        });
      });

    // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete');
  };


  /**
   * modal
   */
  $ionicModal.fromTemplateUrl('templates/genericCommentaryModal.html', {
    scope: $scope,
    viewType: 'bottom-sheet',
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function() {


    if($scope.showCommentaryTip < 2) {
      $cordovaSQLite.execute(db, "UPDATE toolTip SET commentaryTip = commentaryTip + 1");
      $scope.showCommentaryTip += 1
    }

    $scope.modal.show();
    $scope.modalShown = true;
    $scope.updateCommentary()
  };

  $scope.updateCommentary = function(){

    var rashi = [];
    var dovid = [];
    var zion = [];

    var query =
      "SELECT commentary, verse " +
      "FROM tehillim LEFT JOIN tehillimCommentary ON tehillim.chapter = tehillimCommentary.chapter " +
      "WHERE author = 'rashi' AND _id = " + $scope.tehillimId;

    $cordovaSQLite.execute(db, query)
      .then(function(res) {

        for (var i = 0; i < res.rows.length; i++)
          rashi.push(res.rows.item(i).commentary);

        //$scope.rashi = listItems;
      });

    query =
      "SELECT commentary, verse " +
      "FROM tehillim LEFT JOIN tehillimCommentary ON tehillim.chapter = tehillimCommentary.chapter " +
      "WHERE author = 'zion' AND _id = " + $scope.tehillimId;

    $cordovaSQLite.execute(db, query)
      .then(function(res) {

        for (var i = 0; i < res.rows.length; i++)
          zion.push(res.rows.item(i).commentary);
      });

    query =
      "SELECT commentary, verse " +
      "FROM tehillim LEFT JOIN tehillimCommentary ON tehillim.chapter = tehillimCommentary.chapter " +
      "WHERE author = 'dovid' AND _id = " + $scope.tehillimId;

    $cordovaSQLite.execute(db, query)
      .then(function(res) {

        for (var i = 0; i < res.rows.length; i++)
          dovid.push(res.rows.item(i).commentary);
      });

    $scope.commentaries = [{name: "רשי", commentary: rashi}, {name: "מצודת ציון", commentary: zion}, {name: "מצודת דוד", commentary: dovid}];

    $scope.$apply();
  };

  $scope.updateSize = function(){ //here for apple, which needs manual resize (otherwise it stutters)
    setTimeout(function() {
      $ionicScrollDelegate.resize();
    }, 300);

  };

  $scope.closeModal = function(){
    $scope.modal.hide();
    $scope.modalShown = false;
    $rootScope.showCommentary = "";
    $rootScope.commentaryTitle = "Commentary"
  };

  $scope.openSideMenu = function(){
    $scope.closeModal();
    $ionicSideMenuDelegate.toggleLeft();
  };

  $scope.goHome = function(){
    $scope.closeModal();
    $state.go('app.splash');
  };

  /**
   * Update nudge-reminder time when user completes tehillim
   */
  function updateReminder() {

    var today = new Date();
    var alertDate = new Date();
    alertDate.setDate(today.getDate()+7);
    alertDate.setHours(12);
    alertDate.setMinutes(30);
    alertDate.setSeconds(0);
    alertDate = new Date(alertDate);

    $cordovaLocalNotification.schedule({
      id: 2,
      firstAt: alertDate,
      message: "We haven't seen you in a while. Help make a daily siyum in Mishna/Tehillim!",
      title: "Siyum Daily Reminder",
      autoCancel: false,
      sound: 'res://platform_default'
    })

    var snoozeTime = new Date();
    var snoozeHrMin = SettingsService.getSnoozeTime().split(":");
    snoozeTime.setHours(snoozeHrMin[0],snoozeHrMin[1],0);


    snoozeTime.setDate(snoozeTime.getDate() + 1); //push off to tomorrow bc we completed

    $cordovaLocalNotification.schedule({
      id: 1,
      firstAt: snoozeTime,
      message: "Seems you may have forgotten to learn your daily Mishna/Tehillim! We need you to learn your daily limud to finish collectively",
      title: "Siyum Daily Reminder",
      every: "day",
      autoCancel: false,
      sound: 'res://platform_default'
    })
  }

  /**
   * User loads the Tehillim view.
   */
  $scope.$on('$ionicView.beforeEnter', function () {
    //$rootScope.showMenu = true;

    /*
    SponsorFactory.getRandMessageOne().success(function (data) {
      $scope.sponsorMessage = data.message;
    });*/


    $scope.getCycleDay(); //todo rename method

    $cordovaSQLite.execute(db, "SELECT * from toolTip")
      .then(function(res){
        if(res.rows.item(0).commentaryTip < 2)
          $scope.showCommentaryTip = res.rows.item(0).commentaryTip;
        if(res.rows.item(0).referenceTip < 5)
          $scope.showReferenceTip = res.rows.item(0).referenceTip;
        if(res.rows.item(0).completeTip < 2)
          $scope.showCompleteTip = res.rows.item(0).completeTip;
      });

    $cordovaSQLite.execute(db, "SELECT last_completed_tehillim_date, date('now', 'localtime') as now FROM user")
      .then(function(res){

        if(res.rows.item(0).now == res.rows.item(0).last_completed_tehillim_date) {
          $scope.completed = true;
        }
      });
  })
});
