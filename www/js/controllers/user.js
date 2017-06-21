"use strict";

angular.module('starter').controller('UserController', function (
  $scope,
  $rootScope,
  $state,
  $window,
  $timeout,
  $ionicPopup,
  $ionicHistory,
  $ionicPlatform,
  UserFactory,
  MailFactory,
  AdminFactory,
  UserService,
  SettingsService,
  $cordovaSQLite,
  $cordovaLocalNotification
) {
  $ionicHistory.nextViewOptions({
    disableBack: true
  });

  $scope.spin = false;

  /**
   * Register a new user
   */
  $scope.signUp = function () {
    var email = document.getElementById("user-email").value.trim();
    //var selectedMishnaLanguage = document.getElementById("mishna-language").value.trim();

    if (email === '') {
      $scope.showAlert("Sign Up", "<center>Email is required!</center>");
      return false;
    }
    else if(!email.match(/\S+@\S+[.]\S+/g)) {
      $scope.showAlert("Sign Up", "<center>Please enter a valid email address!</center>");
      return false;
    }
    else {
      verifyEmail(email)
    }
  };

  function verifyEmail(email) {

    var code = Math.floor(Math.random()* (100000));

    MailFactory.mailTo(email, code).success(function (data) {});

    $scope.data = {};
    $scope.invalidInputError = false;
    var showPopup = $ionicPopup.show({

      scope: $scope,
      title:'<div class="form-style"><h3>Confirm Email</h3></div>',
      template: '<div class="form-style">'+
      '<h5 style="font-weight:bold;">Thank you for signing up!</h5>' +
      '<input type = "number" ng-model = "data.code">'+
      '<center><p  ng-show="invalidInputError"><strong style="color: red;">invlaid code</strong></p><center>'+
      '<p>We sent you an email with a verification code, use the code above to confirm your email</p>',

      buttons: [
      { text: 'Cancel',
        type: 'button-royal',
      }, {
        text: '<b>Submit</b>',
        type: 'button-stable',
        onTap: function(e) {

          if ($scope.data.code != code) {
            $scope.invalidInputError = true;
            e.preventDefault();
          } else {
            signUpWithDatabase(email)
          }
        }
      }
    ]
    });

    showPopup.then(function (submitted) {
      if (submitted) {

      }else {
        //fail
      }
    });
  }

  function signUpWithDatabase(email) {

    var phone = document.getElementById("user-phone").value.trim();

    $scope.spin = true;
    UserFactory.addNewUser(email, phone).success(function (data) {
      var result = data.status;

      if (result === 'email_already_exist') { //todo make separate method in backend to separate register and existence check
        $scope.showAlert("Sign Up", "It seems like you already have an account with this email address!");
        $scope.spin = false;
        $state.go('signin');
        return false;
      } else if (result === 'register_success') {

        var newUserId = data.userId;


        storeUserInDB(newUserId, email, phone, data.learning_selection, data.alert_time,
          data.last_completed_mishna_date, data.last_completed_tehillim_date,
          data.mishna_id, data.tehillim_id, data.next_cycle_date, data.totalMishna, data.totalTehillim);

        createReminder();

        $scope.spin = false;
        $state.go('app.onboarding');
      }
    })
  }

  /**
   * Sign In method
   */
  $scope.signIn = function () {

    var email = document.getElementById("email").value.trim();

    if (email != '') {
      $scope.spin = true;
      UserFactory.checkUserCredentials(email).success(function (data) {
        var result = data.status;

        if (result === 'login_success') {
          var userId = data.userId;
          var jwtToken = data.jwtToken;


          $scope.spin = false;
          $state.go('app.splash');

          storeUserInDB(userId, email, data.phone, data.learning_selection, data.alert_time,
            data.last_completed_mishna_date, data.last_completed_tehillim_date,
            data.mishna_id, data.tehillim_id, data.next_cycle_date, data.totalMishna, data.totalTehillim);


          storeUserSettingsLocally(data.learning_selection, data.alert_time);

          recreateReminders(data.alert_time);
          UserService.setJwtToken(jwtToken);
          createReminder();
        } else {
          $scope.showAlert("Sign In", "<center>Invalid credentials!</center>");
          $scope.spin = false;
          return false;
        }
      });
    } else {
      $scope.showAlert("Sign In", "<center>Please insert your registered phone number or email!</center>");
    }
  };

  $scope.goToSignIn = function () {
    $state.go('signin');
  };

  $scope.goToSignUp = function () {
    $state.go('signup');
  };

  $scope.logout = function () {
    //UserService.clearUser();
    storeUserSettingsRemotely();
    clearUserFromDb();
    $state.go('signin');
  };

  $scope.showAlert = function (title, msg) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: msg
    });
  };

  /**
   * Create a new Reminder for 4 days from now
   */
  function createReminder() {

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
  }

  function recreateReminders(time) {

    var alarmTime = new Date();
    var snoozeTime = new Date();

    var timePieces = time.split(':');

    alarmTime.setHours (timePieces[0],timePieces[1], 0); // you can pass Number or String, it doesn't matter

    snoozeTime.setTime(alarmTime.getTime() + (4*60*60*1000));
    SettingsService.setSnoozeTime(snoozeTime);

    $cordovaLocalNotification.schedule({
      id: 0,
      firstAt: alarmTime,
      message: "Learn your daily Mishna/Tehillim!",
      title: "Siyum Daily Reminder",
      every: "day",
      autoCancel: false,
      sound: 'res://platform_default'
    })

    $cordovaLocalNotification.schedule({
      id: 1,
      firstAt: snoozeTime,
      message: "Seems you may have forgotten to learn your daily Mishna/Tehillim!",
      title: "Siyum Daily Reminder",
      every: "day",
      autoCancel: false,
      sound: 'res://platform_default'
    });
  }


  function storeUserInDB(userId, email, phone, learning_selection, alert_time,
                         lastMishna, lastTehillim, mishnaId, tehillimId, nextCycle, totalMishna, totalTehillim){
    copyDb(); //redundant db copy
    var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default'});

    var query = "INSERT INTO user VALUES("
      +userId+",'"
      +email+"','"
      +phone+"','"
      +learning_selection +"','"
      +alert_time+ "','"
      +lastMishna+"','"   //last completed mishna
      +lastTehillim+"',"  //last completed tehillim
      +mishnaId+","       //mishna id
      +tehillimId+",'"    //tehillim id
      +nextCycle+"','"    //next cycle
      +lastMishna+"',"
      +totalMishna+","
      +totalTehillim+");";

    $cordovaSQLite.execute(db, query)
      .then(function(){
          //success!
        },
        function(err){
          $scope.showAlert("failed to store user", query +"  " + JSON.stringify(err));
        });
    $window.localStorage.setItem('isLogged',1);
  }

  function storeUserSettingsRemotely() {

    var alertTime = SettingsService.getAlertTime();
    var selected = UserService.getLearningSelection();
    var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default' });

    $cordovaSQLite.execute(db, "SELECT _id FROM user")
      .then(function(res){
        var id = res.rows.item(0)._id;
        UserFactory.storeUserPersonalSettings(id, selected.toString(), alertTime)
      });

  }

  function storeUserSettingsLocally(learning,time) {
    SettingsService.setAlertTime(time);
    UserService.setLearningSelection(learning);
    $rootScope.showMishna = learning.indexOf("mishnayos") > -1;
    $rootScope.showTehillim = learning.indexOf("tehillim") > -1;

  }

  function clearUserFromDb(){
    var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default'});
    var query = "DELETE FROM user";

    $cordovaSQLite.execute(db, query)
      .then(function(){
        },
        function(err){
          $scope.showAlert("error", JSON.stringify(err))
        });
    $window.localStorage.setItem('isLogged',0);
  }

  function copyDb() {
    var location = 0;

    if(ionic.Platform.isIOS())
      location = 2;

    window.plugins.sqlDB.copy("siyumDaily.db", location,

      function () {
      }, function(err) {
        if(err.code == "516"){ //db already exists
          var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default'});

          //using newest addition to database, we know if we need to delete old database and copy in the new one
          $cordovaSQLite.execute(db, "SELECT learning_selection FROM User").then(function(res) {
          }, function (err) {
            //fail, user needs to update database (which clears user info)
            $scope.showAlert("Thank you for updating!", "");
            window.sqlitePlugin.deleteDatabase({name: 'siyumDaily.db', location: 'default'});
            copyDb();

            UserService.clearUser();
            $state.go('signup');
          });
        }
      });
  }

  $scope.$on('$ionicView.beforeEnter', function () {

    //make sure device is ready before moving forward
    // (fixes bug where) app gives white screen after backing out
    $ionicPlatform.ready(function () {
      var isLogged = UserService.getIsLogged();

      if (isLogged === '1')
        $state.go('app.splash');
      copyDb();
    });

  });

});
