
"use strict";

angular.module('starter').controller('DonateController', function ($scope,
  $window,
  $state,
  $ionicNavBarDelegate,
  $ionicLoading,
  $ionicModal,
  $ionicPopup,
  UserService,
  DonateFactory,
  $cordovaSQLite,
  SponsorFactory
) {
  $ionicNavBarDelegate.showBackButton(false);


  var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default'});
  $scope.spin = false;

  $scope.options = [
    ["$100 sponsor 1 day", 100],
    ["$250 full sponsor (1 day)", 250],
    ["$360 full sponsor (2 days)", 360],
    ["$500 sponsor for a week", 500],
    ["Insert my amount in $", null]
  ];

  $scope.selectedOption = '';

  /**
   * Stripe API call.
   */
  $scope.stripeCallback = function (code, result) {

    $scope.spin = false;

    //Don't forget to reset the token!
    var token = '';

    if (result.error) {

      $scope.showAlert("Wrong card details", result.error.message);
    } else {

      var message = document.getElementById("message").value.trim();

      if ($scope.showAmountInput) {
        $scope.sponsorAmount = parseInt(document.getElementById("get-user-amount").value.trim());
      }

      token = result.id;

      if (message === '') {
        $scope.showAlert("Missing sponsor message", "<center>You need to insert a Sponsor message in order to proceed!</center>");
        return false;
      } else if (isNaN($scope.sponsorAmount) || $scope.sponsorAmount === undefined) {
        $scope.showAlert("Missing amount", "<center>You need to select a Sponsor options or insert the amount of your donation in order to proceed!</center>");
        return false;
      }

      var e = document.getElementById("messageType");
      var prefix = e.options[e.selectedIndex].value;

      message = prefix + message;


      $ionicLoading.show({
        template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Processing your payment ...'
      });
      $cordovaSQLite.execute(db, "SELECT email FROM user")
        .then(function(res){
          var email = res.rows.item(0).email + "";

          DonateFactory.pay(email, $scope.sponsorAmount, token).success(function (data) {
            var result = data.status;

            if (result === 'successfully_charged') {
              $ionicLoading.hide();
              $scope.showAlert("Thank you!", "<center><img class='center' ng-src='img/mishna-donate.png' width='60' height='60'>Awesome! Your sponsor message is now being processed by the Admin it will be visible in the main screen very soon. In case your message has been rejected, we will contact you and process a direct refund.</center>");

              //We send the Donation details to the Admin in order to accept or reject it.
              DonateFactory.contactAdmin(
                email,
                $scope.selectedOption,
                $scope.sponsorAmount,
                message).success(function (data) { });
              $state.go('app.splash');
            } else if (result === 'no_charge') {
              $ionicLoading.hide();
              $scope.showAlert("No charge", "Sorry, we was unable to charge your card, please try later on!");
            }else {
              $scope.showAlert("error, please report to app author", JSON.stringify(data));
              $ionicLoading.hide();
            }
          });
        });
    }
  };

  /**
   * Refresh the Amount input.
   */
  $scope.refreshAmount = function (amount) {
    if (amount === '') {
      $scope.showAmountInput = true;
      $scope.sponsorAmount = '';
    } else {
      $scope.showAmountInput = false;
      $scope.sponsorAmount = parseInt(amount);
    }

    if (amount === "100") {
      $scope.selectedOption = "$100  sponsor a day";
    } else if (amount === "250") {
      $scope.selectedOption = "$250  full sponsor (1 day)";
    } else if (amount === "360") {
      $scope.selectedOption = "$360  full sponsor (2 days)";
    } else if (amount === "500") {
      $scope.selectedOption = "$500  sponsor for a week";
    } else if (amount === '') {
      $scope.selectedOption = "User choose to donate his own amount";
    }
  };

  $scope.spinForCallback = function () {
    $scope.spin = true;
  };

  $scope.$on('$ionicView.beforeEnter', function () {
    if(ionic.Platform.isIOS){
      window.open("http://www.ateresshimon.org/donateApple.html",'_system', 'location=yes');
      $state.go('app.splash');
    }

  });

  /**
   * Display Alert notification.
   */
  $scope.showAlert = function (title, msg) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: msg
    });
  };

})
