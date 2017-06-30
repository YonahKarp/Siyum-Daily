
"use strict";

angular.module('starter').controller('DonateController', function ($scope,
  $window,
  $state,
  $ionicNavBarDelegate
) {
  $ionicNavBarDelegate.showBackButton(false);

  $scope.$on('$ionicView.beforeEnter', function () {
      window.open("http://www.ateresshimon.org/donateApple.html",'_system', 'location=yes');
      $state.go('app.splash');
  });
});
