"use strict";

angular.module('starter').controller('InfoController', function (
  $scope, $rootScope,
  $state,
  $timeout,
  AdminFactory,
  $cordovaSQLite,
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

  $scope.$on('$ionicView.enter', function () {
    $scope.percentProgress = 0;

    var updateBar = setInterval(function(){
      $scope.percentProgress++;
      if($scope.percentProgress >= $scope.yourMishnaTotal + $scope.yourTehillimTotal || $scope.percentProgress >= 100)
        clearInterval(updateBar);
      $scope.$apply();
    },20);
  });


});
