"use strict";

angular.module('starter').controller('InfoController', function (
  $scope, $rootScope,
  $state,
  $timeout,
  AdminFactory,
  SponsorFactory,
  UserService,
  $cordovaSQLite,
  $ionicPopup,
  $ionicHistory
) {
  $ionicHistory.nextViewOptions({
    disableBack: true
  });

  var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default'});


  $scope.$on('$ionicView.beforeEnter', function () {

    AdminFactory.getStatInfo().success(function (data) {

      $scope.mishnaCycle = data.mishnaCycle;
      $scope.tehillimCycle = data.tehillimCycle;

      $scope.mishnaTotal = data.totalMishnayos;
      $scope.tehillimTotal = data.totalTehillim;

      $scope.newMishnayos = data.lastWeekMishnayos;
      $scope.newTehillim = data.lastWeekTehillim;
      $scope.percentProgress = 0;

    });

    $cordovaSQLite.execute(db, "SELECT total_mishna_completed, total_tehillim_completed FROM User")
      .then(function(res){
        $scope.yourMishnaTotal = res.rows.item(0).total_mishna_completed;
        $scope.yourTehillimTotal = res.rows.item(0).total_tehillim_completed;
      });

    var today = new Date();
    var d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    $scope.sunday = (d.getMonth()+1)  + "/" + d.getDate() + "/" + d.getFullYear();


  });

  $scope.showSponsorMessageModal = function(){

    var confirmPopup = $ionicPopup.confirm({
      title: 'Free Sponsor Message!',
      templateUrl: "templates/sponsorMessageModal.html",
      cancelText: "cancel"
    });

    //if($rootScope.percentProgress >= 100)
      confirmPopup.then(function (completed) {
        if (completed) {
          $cordovaSQLite.execute(db, "SELECT email FROM user")
            .then(function(res){
              var email = res.rows.item(0).email;
              var message = document.getElementById("sponsorMessage").value;
              var type = document.getElementById("sponsorType").value + " ";

              $scope.showAlert(email, type + message);

              SponsorFactory.postFreeMessage(email, type + message);
              UserService.setRewardsSpent(UserService.getRewardsSpent()+1);
              updateProgressBar();
            });
        }
      })
  };

  function updateProgressBar(){
    $scope.percentProgress = 0;
    var updateBar = setInterval(function(){
      $scope.percentProgress++;
      if($scope.percentProgress >= ($scope.yourMishnaTotal + $scope.yourTehillimTotal) - 100*UserService.getRewardsSpent() || $scope.percentProgress >= 100) {
        clearInterval(updateBar);
        $scope.percentProgress = $scope.yourMishnaTotal + $scope.yourTehillimTotal - 100 * UserService.getRewardsSpent();
      }
      $scope.$apply();
    },20);
  }

  $scope.$on('$ionicView.enter', function () {
    updateProgressBar();
  });


});
