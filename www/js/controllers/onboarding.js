/**
 * Created by YonahKarp on 2/16/17.
 */
"use strict";

angular.module('starter').controller('OnboardingController', function (
  $scope, $rootScope,
  $state,
  ionicTimePicker,
  SettingsService,
  UserService,
  UserFactory,
  $ionicNavBarDelegate,
  $cordovaLocalNotification,
  $ionicSideMenuDelegate,
  $ionicHistory,
  NotificationService
) {
  $ionicNavBarDelegate.showBackButton(false);

  $ionicHistory.nextViewOptions({
    disableBack: true
  });

  $ionicSideMenuDelegate.canDragContent(false);


  var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default' });

  var selected = [];

  $scope.learningChoices = [
    { text: "mishnayos", checked: false },
    { text: "tehillim", checked: false },
  ];

  $scope.onSelected = function(){
    if(selected.length > 0)
      $scope.didSelect = true;
    else
      $scope.showAlert("Nothing selected", "please select the siyum you wish to help with")
  };

  $scope.checkedOrNot = function (asset, isChecked) {
    if (isChecked) {
      selected.push(asset);
    }
    else {
      var index = selected.indexOf(asset);
      if (index > -1) {
        selected.splice(index, 1);
      }
    }
  };

  /**
   * Timepicker allows for ui selection of alert time
   */
  var timePicker = {
    callback: function (val) {
      if (typeof (val) === 'undefined') {

      } else {
        var selectedTime = new Date(val * 1000);
        var time = selectedTime.getUTCHours() + ":" + selectedTime.getUTCMinutes();
        $scope.createReminder(time);
      }
    },
    inputTime: 48600,
    format: 12,
    step: 15,
    closeLabel: "No Reminder"
  };

  $scope.openTimePicker = function () {
    ionicTimePicker.openTimePicker(timePicker);
    $scope.currentAlertTime = "none";
  };

  /**
   * Create a new Reminder notification.
   */
  $scope.createReminder = function(time) {
    NotificationService.createReminder(time);
    updateUIAlarmTime(time);
  };

  //set ui to reflect time
  function updateUIAlarmTime(time){
    time = convert24to12(time);
    $scope.currentAlertTime = time;
    SettingsService.setAlertTime(time);
  }

  //converts time form 24 to 12.
  //    ex 13:00 -> 1:00 pm
  function convert24to12(time){
    var timeFrags = time.split(':');
    var hour = parseInt(timeFrags[0]);
    var minute = parseInt(timeFrags[1]);

    var amPm = (hour < 12)? " am":" pm";
    hour = ((hour % 12 == 0)? 12: hour % 12);
    minute = (minute == 0)? "00": minute;

    return hour + ":" + minute + amPm
  }

  $scope.cancelReminder = function() {
    cordova.plugins.notification.local.cancelAll(function() {
      $scope.showAlert("Mishna Reminder", "Your daily reminder is now canceled!");
    }, this);
  };

  $scope.onSubmit = function () {
    UserService.setLearningSelection(selected);

    $rootScope.showMishna = selected.indexOf("mishnayos") > -1;
    $rootScope.showTehillim = selected.indexOf("tehillim") > -1;

    $state.go('app.splash')
  };
});
