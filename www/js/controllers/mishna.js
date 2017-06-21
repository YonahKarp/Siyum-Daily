"use strict";

angular.module('starter').controller('MishnaController', function (
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
  MishnaFactory,
  UserFactory,
  AdminFactory,
  SettingsFactory,
  //SponsorFactory,
  SettingsService,
  UserService,
  $cordovaSQLite
) {
  $ionicNavBarDelegate.showBackButton(false);
  $scope.viewtitle = '<span class="view-title">' + ' משנה daily' + '</span><br><span class="view-subtitle"> - ' + 'Yeshiva Ateres Shimon' + '</span>';
  $scope.learningView = "mishnaView";


  $scope.completed = false;
  $rootScope.showCommentary = '';
  $rootScope.commentaryTitle = "Commentary";

  $scope.table ='משנה'; // mishna/tehillim

  //if(window.StatusBar)
    //StatusBar.overlaysWebView(true);


  var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default' });


  /**
   * Will return to the view the number of days left for the next Mishna update.
   * And will see if mishna needs to be updated
   */
  $scope.getMishna = function () {

    $cordovaSQLite.execute(db, "SELECT _id, mishna_id, julianDay('now') as now, julianDay(next_cycle_date) as next, julianDay(next_cycle_date) -  julianDay('now') as dateDiff FROM user")
      .then(function(res){


        $scope.cycleDays = Math.ceil(parseFloat(res.rows.item(0).dateDiff) + 0.5);

        //if the user's date shows new mishna is needed we check the server if update is really needed
        if(res.rows.item(0).dateDiff <= -0.5){

          AdminFactory.getCyclePeriodAndStatus(res.rows.item(0)._id).success(function (data) {

            $cordovaSQLite.execute(db, "UPDATE user SET next_cycle_date = '"+data.nextDate+"'");
            setCycleDay();

            if (data.needsUpdate) {
              $cordovaSQLite.execute(db, "UPDATE user SET tehillim_id = -1");
              $scope.getAnotherMishna();
            }
            else {
              if(parseInt(res.rows.item(0).mishna_id) != -1)
                $scope.showAlert("Retrieval error","sorry, your clock may not be set correctly");
              rebuildMishna(res.rows.item(0).mishna_id)
            }
          }).error(function () {
            $scope.showAlert("Retrieval error","Please connect to the internet to update your mishna");
          });
        }else{
          rebuildMishna(res.rows.item(0).mishna_id)
        }
      });
  };

  function setCycleDay() {
    $cordovaSQLite.execute(db, "SELECT julianDay(next_cycle_date) -  julianDay('now') as dateDiff FROM user")
      .then(function (res) {
        $scope.cycleDays = Math.ceil(parseFloat(res.rows.item(0).dateDiff) + 0.5);
      });
  }

  /**
   * When the user hits the 'Mark As Complete' button
   **/
  $scope.markAsCompleted = function () {

    $cordovaSQLite.execute(db, "SELECT last_completed_mishna_date, date('now', 'localtime') as now FROM user")
      .then(function(res){
        var completedDate = res.rows.item(0).last_completed_mishna_date;

        if(res.rows.item(0).now !=  completedDate) {
           launchPopup()
        }else {
          $scope.showAlert("Already completed", "Great job, you already completed your mishna today (" + completedDate + ") \n Help make a siyum again by finishing your mishna tomorrow as well!");
          $scope.completed = true;
        }
    });
  };

  function launchPopup(){

    if($scope.showCompleteTip < 2) {
      $cordovaSQLite.execute(db, "UPDATE toolTip SET completeTip = completeTip + 1");
      $scope.showCompleteTip += 1;
    }

    var confirmPopup = $ionicPopup.confirm({
      title: 'Mazel Tov!',
      template:'<img class="center" src="img/mishna-trophy.png" width="150" height="150">' +
      '<p>We will give you another Mishna at the next cycle period, please don\'t forget the completed button in order to stay as an active user!</p>',
      cancelText: "undo"

    });

    confirmPopup.then(function (completed) {

      $scope.disableCompleteButton = true;
      if (completed) {
        $cordovaSQLite.execute(db, "SELECT _id, mishna_id FROM user")
          .then(function(res){

            var mishnaId = res.rows.item(0).mishna_id;
            var userId = res.rows.item(0)._id;

            MishnaFactory.completeMishna(userId, mishnaId).success(function (data) {
              var result = data.status;
              if (result === "complete_mishna_success") {

                var query = "UPDATE user SET last_completed_mishna_date = date('now','localtime')";
                $cordovaSQLite.execute(db, query);
                query = "UPDATE user SET total_mishna_completed = total_mishna_completed + 1";
                $cordovaSQLite.execute(db, query);

                $scope.completed = true;
                updateReminder();

                if (!$scope.$$phase)
                  $scope.$digest();
              } else
                $scope.showAlert("Internal error", "Sorry unable to complete this Mishna");
            }).error(function () {
              $scope.showAlert("Network error", "Please connect to the internet before completing the Mishna");

            });
        });
      }else
        $scope.showAlert("Ok", "The mishna was not marked as complete");

      $scope.disableCompleteButton = false;

    });
  }

  $scope.getAnotherMishna = function () {

    $cordovaSQLite.execute(db, "SELECT _id FROM user")
      .then(function(res) {
        var userId = res.rows.item(0)._id;

        MishnaFactory.randomMishna(userId).success(function (data) {

          $scope.mishnaId = data.mishna_id;

          rebuildMishna(data.mishna_id);

          //handle data locally
          $cordovaSQLite.execute(db, "UPDATE user SET mishna_id = " + data.mishna_id);

          //Set the date of the last assigned Mishna.
          MishnaFactory.setMishnaAssignDate(userId);

          setCycleDay();
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

    var query = "SELECT _id, mesechta || ': '|| chapterLetter || ', ' || mishnaLetter as title, hebrew, english FROM mishna WHERE _id = "+(parseInt($scope.mishnaId) + direction);

    $cordovaSQLite.execute(db, query)
      .then(function(res) {

        $scope.hebrew = '';

        $scope.mishnaId = res.rows.item(0)._id;
        $scope.title = res.rows.item(0).title;


        $scope.hebrewContext = res.rows.item(0).hebrew;
        $scope.english = res.rows.item(0).english.replace(/<.{1,3}>/g, '');

      });
  };

  $scope.backToLearning = function () {
    $cordovaSQLite.execute(db, "SELECT mishna_id FROM user")
      .then(function(res){
        rebuildMishna(res.rows.item(0).mishna_id);
        $scope.updateCommentary()
      });

  };

  var rebuildMishna = function (mishnaId) {

    if(parseInt(mishnaId) == -1) {
      $scope.getAnotherMishna();
      return
    }

    $cordovaSQLite.execute(db, "SELECT _id, mesechta || ': '|| chapterLetter || ', ' || mishnaLetter as title, hebrew, english FROM mishna WHERE _id = "+ parseInt(mishnaId))
      .then(function(res){

        $scope.hebrewContext = '';

        $scope.mishnaId = res.rows.item(0)._id;
        $scope.title = res.rows.item(0).title;

        $scope.hebrew= res.rows.item(0).hebrew;
        $scope.english = res.rows.item(0).english.replace(/<.{1,3}>/g, '');
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
   * Refresh
   */
  $scope.doRefresh = function() {

    $cordovaSQLite.execute(db, "SELECT _id, mishna_id FROM user")
      .then(function(res) {
        var userId = res.rows.item(0)._id;
        var mishnaId = res.rows.item(0).mishna_id;

        AdminFactory.getCyclePeriodAndStatus(userId).success(function (data) {
          //$scope.mishnaCycleDays = data.nextDate;
          $cordovaSQLite.execute(db, "UPDATE user SET next_cycle_date = '"+data.nextDate+"'");
          setCycleDay();


          if (data.needsUpdate) {
            $scope.getAnotherMishna();
          }
          else {
            rebuildMishna(mishnaId)
          }
        });
      });

    // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete');
  };

  /**
   * modal stuffs
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

    var bartenura = [];
    var tosfosYT = [];

    var query =
      "SELECT commentary " +
      "FROM mishna LEFT JOIN commentary ON mishna.mapKey = commentary.mapKey " +
      "WHERE author = 'bartenura' AND _id = " + $scope.mishnaId;

    $cordovaSQLite.execute(db, query)
      .then(function(res) {

        for (var i = 0; i < res.rows.length; i++)
          bartenura.push(res.rows.item(i).commentary);
      });

    query =
      "SELECT commentary " +
      "FROM mishna LEFT JOIN commentary ON mishna.mapKey = commentary.mapKey " +
      "WHERE author = 'tosfosYT' AND _id = " + $scope.mishnaId;

    $cordovaSQLite.execute(db, query)
      .then(function(res) {

        for (var i = 0; i < res.rows.length; i++)
          tosfosYT.push(res.rows.item(i).commentary);
      });

    $scope.commentaries = [{name: "ברטנורא", commentary: bartenura}, {name: "תוספות יום טוב", commentary: tosfosYT}];
    $scope.$apply();
  };

  $scope.updateSize = function(){
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
   * Update nudge-reminder time when user completes mishna
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
    });


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
    });

  }

  /**
   * User load the Mishna view.
   */
  $scope.$on('$ionicView.beforeEnter', function () {
    //$rootScope.showMenu = true;
    $scope.spin = true;

    /*
    SponsorFactory.getRandMessageOne().success(function (data) {
      $scope.sponsorMessage = data.message;
    });*/

    $scope.getMishna();

    $cordovaSQLite.execute(db, "SELECT * from toolTip")
      .then(function(res){
        if(res.rows.item(0).commentaryTip < 2)
          $scope.showCommentaryTip = res.rows.item(0).commentaryTip;
        if(res.rows.item(0).referenceTip < 5)
          $scope.showReferenceTip = res.rows.item(0).referenceTip;
        if(res.rows.item(0).completeTip < 2)
          $scope.showCompleteTip = res.rows.item(0).completeTip;
      });

    $cordovaSQLite.execute(db, "SELECT last_completed_mishna_date, date('now', 'localtime') as now FROM user")
      .then(function(res){

        if(res.rows.item(0).now == res.rows.item(0).last_completed_mishna_date) {
         $scope.completed = true;
        }
      });

  })
})
/**
 * pulled from http://codepen.io/jabas06/pen/vOMxjK
 * allows modal to only cover half the screen (where commentary will be placed)
 */
  .directive('ionBottomSheet', [function() {
    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      controller: [function() {}],
      template: '<div class="modal-wrapper" ng-transclude></div>'
    };
  }])
  .directive('ionBottomSheetView', function() {
    return {
      restrict: 'E',
      compile: function(element) {
        element.addClass('bottom-sheet modal');
      }
    };
  });
