/**
 * Created by YonahKarp on 2/8/17.
 */
"use strict";

angular.module('starter').controller('TehillimChildController', function (
  $scope,
  $state,
  $ionicPopup,
  $ionicModal,
  $rootScope,
  $ionicNavBarDelegate,
  $ionicSlideBoxDelegate,
  $ionicSideMenuDelegate,
  $ionicScrollDelegate,
  TehillimFactory,
  UserFactory,
  AdminFactory,
  NotificationService,
  SettingsService,
  UserService,
  $cordovaSQLite,
  $controller
) {

  var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default'});

  $scope.viewtitle = '<span class="view-title">' + ' תהלים daily' + '</span>';
  $scope.learningView = "tehillimView";


  $scope.table ='תהלים';
  $rootScope.table = 'תהלים';

  $scope.tableName = "tehillim";
  $scope.otherTable = "mishna";
  $scope.factory = TehillimFactory;

  $scope.titleQuery = " 'chapter: ' || chapterLetter";


  $controller('LearningController', {$scope: $scope});

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
      "WHERE author = 'rashi' AND _id = " + $scope.learningId;

    $cordovaSQLite.execute(db, query)
      .then(function(res) {

        for (var i = 0; i < res.rows.length; i++)
          rashi.push(res.rows.item(i).commentary);

        //$scope.rashi = listItems;
      });

    query =
      "SELECT commentary, verse " +
      "FROM tehillim LEFT JOIN tehillimCommentary ON tehillim.chapter = tehillimCommentary.chapter " +
      "WHERE author = 'zion' AND _id = " + $scope.learningId;

    $cordovaSQLite.execute(db, query)
      .then(function(res) {

        for (var i = 0; i < res.rows.length; i++)
          zion.push(res.rows.item(i).commentary);
      });

    query =
      "SELECT commentary, verse " +
      "FROM tehillim LEFT JOIN tehillimCommentary ON tehillim.chapter = tehillimCommentary.chapter " +
      "WHERE author = 'dovid' AND _id = " + $scope.learningId;

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
   * Update nudge-reminder time when user completes tehillim
   */
  function updateReminder() {
    NotificationService.updateReminder();
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

    $cordovaSQLite.execute(db, "SELECT last_completed_tehillim_date, date('now', 'localtime') as now FROM user")
      .then(function(res){

        if(res.rows.item(0).now == res.rows.item(0).last_completed_tehillim_date) {
          $scope.completed = true;
        }
      });
  })
});
