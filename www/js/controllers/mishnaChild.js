/**
 * Created by YonahKarp on 6/30/17.
 */
"use strict";

angular.module('starter').controller('MishnaChildController', function (
  $scope,
  $state,
  $ionicPopup,
  $ionicModal,
  $rootScope,
  $controller,
  $ionicNavBarDelegate,
  $ionicSlideBoxDelegate,
  $ionicSideMenuDelegate,
  $ionicScrollDelegate,
  MishnaFactory,
  UserFactory,
  AdminFactory,
  NotificationService,
  SettingsService,
  UserService,
  $cordovaSQLite
) {

  var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default' });

  $scope.viewtitle = '<span class="view-title">' + ' משנה daily' + '</span><br><span class="view-subtitle"> - ' + 'Yeshiva Ateres Shimon' + '</span>';
  $scope.learningView = "mishnaView";

  $scope.table ='משנה';
  $scope.tableName = "mishna";
  $scope.otherTable = "tehillim";
  $scope.factory = MishnaFactory;

  $scope.titleQuery = "mesechta || ': '|| chapterLetter || ', ' || mishnaLetter";

  $controller('LearningController', {$scope: $scope});

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
    $scope.updateCommentary();
  };

  $scope.updateCommentary = function(){

    var bartenura = [];
    var tosfosYT = [];

    var query =
      "SELECT commentary " +
      "FROM mishna LEFT JOIN commentary ON mishna.mapKey = commentary.mapKey " +
      "WHERE author = 'bartenura' AND _id = " + $scope.learningId;

    $cordovaSQLite.execute(db, query)
      .then(function(res) {


        for (var i = 0; i < res.rows.length; i++)
          bartenura.push(res.rows.item(i).commentary);
      },
      function(err){
        $scope.showAlert("failed get info", query +"  " + JSON.stringify(err));
      });

    query =
      "SELECT commentary " +
      "FROM mishna LEFT JOIN commentary ON mishna.mapKey = commentary.mapKey " +
      "WHERE author = 'tosfosYT' AND _id = " + $scope.learningId;

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
    }, 200);

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
   * User load the Mishna view.
   */
  $scope.$on('$ionicView.beforeEnter', function () {
    //$rootScope.showMenu = true;
    $scope.spin = true;

    /*
     SponsorFactory.getRandMessageOne().success(function (data) {
     $scope.sponsorMessage = data.message;
     });*/

    $scope.getLearning();

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
});
