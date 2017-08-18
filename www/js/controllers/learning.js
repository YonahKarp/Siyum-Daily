/**
 * Created by YonahKarp on 6/30/17.
 */
"use strict";

angular.module('starter').controller('LearningController', function (
  $scope,
  $rootScope,
  $state,
  $ionicNavBarDelegate,
  $ionicSlideBoxDelegate,
  $ionicSideMenuDelegate,
  $ionicScrollDelegate,
  $ionicPopup,
  UserFactory,
  AdminFactory,
  NotificationService,
  SettingsService,
  UserService,
  $cordovaSQLite
) {
  $ionicNavBarDelegate.showBackButton(false);

  $scope.completed = false;
  $rootScope.showCommentary = '';
  $rootScope.commentaryTitle = "Commentary";

  var db = window.sqlitePlugin.openDatabase({name: 'siyumDaily.db', location: 'default' });


  /**
   * Will return to the view the number of days left for the next update.
   * And will see user needs to be updated
   */
  $scope.getLearning = function () {

    $cordovaSQLite.execute(db, "SELECT _id, "+$scope.tableName+"_id as learning_id, julianDay('now') as now, julianDay(next_cycle_date) as next, julianDay(next_cycle_date) -  julianDay('now') as dateDiff FROM user")
      .then(function(res){

        $scope.cycleDays = Math.ceil(parseFloat(res.rows.item(0).dateDiff) + 0.5);

        //if the user's date shows new mishna is needed we check the server if update is really needed
        if(res.rows.item(0).dateDiff <= -0.5){

          AdminFactory.getCyclePeriodAndStatus(res.rows.item(0)._id).success(function (data) {

            $cordovaSQLite.execute(db, "UPDATE user SET next_cycle_date = '"+data.nextDate+"'");
            setCycleDay();

            if (data.needsUpdate) {
              $cordovaSQLite.execute(db, "UPDATE user SET "+$scope.otherTable+"_id = -1");
              $scope.getAnotherLearning();
            }
            else {
              if(parseInt(res.rows.item(0).learning_id) != -1)
                $scope.showAlert("Retrieval error","sorry, your clock may not be set correctly");
              rebuildLearningUI(res.rows.item(0).learning_id)
            }
          }).error(function () {
            $scope.showAlert("Retrieval error","Please connect to the internet to update your " + $scope.tableName);
          });
        }else{
          rebuildLearningUI(res.rows.item(0).learning_id)
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

    $cordovaSQLite.execute(db, "SELECT last_completed_"+$scope.tableName+"_date as lastDate, date('now', 'localtime') as now FROM user")
      .then(function(res){
        var completedDate = res.rows.item(0).lastDate;

        if(res.rows.item(0).now !=  completedDate) {
          launchPopup()
        }else {
          $scope.showAlert("Already completed", "Great job, you already completed your "+ $scope.tableName+" today (" + completedDate + ") \n Help make a siyum again by finishing your "+ $scope.tableName+" tomorrow as well!");
          $scope.completed = true;
        }
      });
  };

  function launchPopup(){

    if($scope.showCompleteTip < 2) {
      $cordovaSQLite.execute(db, "UPDATE toolTip SET completeTip = completeTip + 1");
      $scope.showCompleteTip += 1;
    }

    $rootScope.percentProgress = 0;
    $cordovaSQLite.execute(db, "SELECT total_mishna_completed, total_tehillim_completed FROM User").then(function(res){
        $scope.max = res.rows.item(0).total_mishna_completed + res.rows.item(0).total_tehillim_completed;
    });

    var updateBar = setInterval(function(){
      $rootScope.percentProgress++;
      if($rootScope.percentProgress > $scope.max || $rootScope.percentProgress >= 100)
        clearInterval(updateBar);
      $scope.$apply();
    },20);



    var confirmPopup = $ionicPopup.confirm({
      title: 'Mazel Tov!',
      templateUrl: "templates/progressBar.html",
      cancelText: "undo"
    });

    confirmPopup.then(function (completed) {

      $scope.disableCompleteButton = true;
      if (completed) {
        $cordovaSQLite.execute(db, "SELECT _id, "+ $scope.tableName+"_id as learning_id FROM user")
          .then(function(res){

            var learningId = res.rows.item(0).learning_id;
            var userId = res.rows.item(0)._id;

            $scope.factory.completeLearning(userId, learningId).success(function (data) {
              var result = data.status;
              if (result === "complete_"+$scope.tableName+"_success") {

                var query = "UPDATE user SET last_completed_"+$scope.tableName+"_date = date('now','localtime')";
                $cordovaSQLite.execute(db, query);
                query = "UPDATE user SET total_"+$scope.tableName+"_completed = total_"+$scope.tableName+"_completed + 1";
                $cordovaSQLite.execute(db, query);

                $scope.completed = true;
                updateReminder();

                if (!$scope.$$phase)
                  $scope.$digest();
              } else
                $scope.showAlert("Internal error", "Sorry unable to complete this "+ $scope.tableName);
            }).error(function () {
              $scope.showAlert("Network error", "Please connect to the internet before completing the "+ $scope.tableName);

            });
          });
      }else
        $scope.showAlert("Ok", "The "+ $scope.tableName+" was not marked as complete");

      $scope.disableCompleteButton = false;

    });
  }


  $scope.getAnotherLearning = function () {

    $cordovaSQLite.execute(db, "SELECT _id FROM user")
      .then(function(res) {
        var userId = res.rows.item(0)._id;

        $scope.factory.getRandomLearning(userId).success(function (data) {

          $scope.learningId = data.learning_id;

          rebuildLearningUI(data.learning_id);

          //handle data locally
          $cordovaSQLite.execute(db, "UPDATE user SET "+$scope.tableName+"_id = " + data.learning_id);

          //Set the date of the last assigned Mishna.
          $scope.factory.setAssignDate(userId);

          setCycleDay();
        });
      });
  };

  $scope.getContext = function (direction) {

    if($scope.showReferenceTip < 5){
      $cordovaSQLite.execute(db, "UPDATE toolTip SET referenceTip = referenceTip + 1");
      $scope.showReferenceTip += 1;

      $scope.showAlert("Please Note", "You are committed to only one Mishna or perek of tehillim. <br> The arrows are only for further personal study.<br> (Message will show " +
        (5-$scope.showReferenceTip)+ " more times) ");
    }

    var query = "SELECT _id,"+$scope.titleQuery+" as title, hebrew, english FROM "+$scope.tableName+" WHERE _id = "+(parseInt($scope.learningId) + direction);

    $cordovaSQLite.execute(db, query)
      .then(function(res) {

        $scope.hebrew = '';

        $scope.learningId = res.rows.item(0)._id;
        $scope.title = res.rows.item(0).title;

        $scope.hebrewContext = res.rows.item(0).hebrew;
        $scope.english = res.rows.item(0).english.replace(/<.{1,3}>/g, '');

      });
  };

  $scope.backToLearning = function () {
    $cordovaSQLite.execute(db, "SELECT "+$scope.tableName+"_id as learning_id FROM user")
      .then(function(res){
        rebuildLearningUI(res.rows.item(0).learning_id);
        $scope.updateCommentary()
      });

  };


  var rebuildLearningUI = function (learningId) {

    if(parseInt(learningId) == -1) {
      $scope.getAnotherLearning();
      return
    }

    $cordovaSQLite.execute(db, "SELECT _id, "+ $scope.titleQuery+"  as title, hebrew, english FROM "+$scope.tableName+" WHERE _id = "+ parseInt(learningId))
      .then(function(res){

        $scope.hebrewContext = '';

        $scope.learningId = res.rows.item(0)._id;
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

    $cordovaSQLite.execute(db, "SELECT _id, "+$scope.tableName+"_id as learning_id FROM user")
      .then(function(res) {
        var userId = res.rows.item(0)._id;
        var learningId = res.rows.item(0).learning_id;

        AdminFactory.getCyclePeriodAndStatus(userId).success(function (data) {
          $cordovaSQLite.execute(db, "UPDATE user SET next_cycle_date = '"+data.nextDate+"'");
          setCycleDay();


          if (data.needsUpdate)
            $scope.getAnotherLearning();
          else
            rebuildLearningUI(learningId)

        });
      });

    // Stop the ion-refresher from spinning
    $scope.$broadcast('scroll.refreshComplete');
  };

  /**
   * Update nudge-reminder time when user completes mishna
   */
  function updateReminder() {
    NotificationService.updateReminder()
  }
}).directive('ionBottomSheet', [function() {
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
