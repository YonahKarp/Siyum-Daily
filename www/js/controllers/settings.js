"use strict";

angular.module('starter').controller('SettingsController', function(
    $scope,  $rootScope,
    $state,
    $window,
    $ionicPopup,
    ionicTimePicker,
    $ionicNavBarDelegate,
    $cordovaLocalNotification,
    UserService,
    SettingsService,
    UserFactory,
    $cordovaSQLite,
    NotificationService
) {
    $ionicNavBarDelegate.showBackButton(false);

  var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default'});
  var selected = [];
    $scope.currentAlertTime = '';
    $scope.learningStatus = false;


    /**
     * Get the current User details.
     **/
    $scope.getPersonalDetails = function() {
        getDetailsFromDb();
        $scope.currentAlertTime = convert24to12(SettingsService.getAlertTime());

        selected = UserService.getLearningSelection().split(",");

        $scope.learningChoices = [
          { text: "mishnayos", checked: selected.indexOf("mishnayos") > -1 },
          { text: "tehillim", checked: selected.indexOf("tehillim") > -1 }
        ];
    };


    function getDetailsFromDb(){

      $cordovaSQLite.execute(db, "SELECT email, phone FROM user")
        .then(function(res){

            $scope.email =  res.rows.item(0).email + "";
            $scope.phone = res.rows.item(0).phone + "";
          });
    }

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
    updateSelectionAcrossApp();
  };

  function updateSelectionAcrossApp(){
    UserService.setLearningSelection(selected);

    $rootScope.showMishna = selected.indexOf("mishnayos") > -1;
    $rootScope.showTehillim = selected.indexOf("tehillim") > -1;
  }

    $scope.goToSplash = function () {
      $state.go('app.splash');
    };


    /**
     * User wants to delete his account :S
     **/
    $scope.deleteAccount = function() {
        $scope.showConfirm();
    };


    $scope.showAlert = function(title, msg) {
        var alertPopup = $ionicPopup.alert({
            title: title,
            template: msg
        });
    };

    //Display confirmation of saved Settings.
    $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Settings',
            okText: 'Yes',
            cancelText: 'No',
            template: 'Do you really want to delete your account?'
        });

        confirmPopup.then(function(res) {
            if (res) {
              $cordovaSQLite.execute(db, "SELECT _id FROM user")
                .then(function(result) {

                  var userId = result.rows.item(0)._id;

                  UserFactory.delete(userId).success(function (data) {
                    var result = data.status;
                    if (result === 'delete_success') {
                      clearUserFromDb();
                      $scope.showAlert("Settings", "You're account is now deleted!");
                      $state.go('signin');
                    }
                  });
                });
            } else {
                confirmPopup.close();
            }
        });
    };

    function clearUserFromDb(){
      var query = "DELETE FROM user";

      $cordovaSQLite.execute(db, query)
        .then(function(){
          });
      $window.localStorage.setItem('isLogged',0);
    }


    $scope.setReminderTime = function(time) {
        if (time === 'Cancel Reminder') {
            //$scope.$emit('cancelReminder');
          $scope.cancelReminder()
        } else {
            //$scope.$emit('setReminder', time);
          $scope.createReminder(time)
        }
    }


  /**
   * Timepicker allows for ui selection of alert time
   */
  var timePicker = {
    callback: function (val) {
      if (typeof (val) === 'undefined') {

      } else {
        var selectedTime = new Date(val * 1000);
        var time = selectedTime.getUTCHours() + ":" + selectedTime.getUTCMinutes();
        //$scope.showAlert("your time", time);
        $scope.createReminder(time);
      }
    },
    inputTime: 48600,
    format: 12,
    step: 15,
    closeLabel: "Cancel"
  };

  $scope.openTimePicker = function () {
    ionicTimePicker.openTimePicker(timePicker);
  };

  //set ui to reflect time
  function updateUIAlarmTime(time){
    time = convert24to12(time);
    $scope.currentAlertTime = time;
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

  /**
   * Create a new Reminder notification.
   */
   $scope.createReminder = function(time) {
     NotificationService.createReminder(time);
     $scope.showAlert("Daily Reminder", "Your daily reminder is now set!");
     updateUIAlarmTime(time);
   };

  $scope.cancelReminder = function() {
    $cordovaLocalNotification.cancelAll();
    cordova.plugins.notification.local.cancelAll(function() {
      $scope.showAlert("Mishna Reminder", "Your daily reminder is now canceled!");
    }, this);

    $scope.currentAlertTime = "";
    SettingsService.setAlertTime("");
  };


//When the user load the Settings view.
  $scope.$on('$ionicView.beforeEnter', function() {
      $scope.getPersonalDetails();
  });
});
