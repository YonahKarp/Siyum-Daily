"use strict";

angular.module('starter').controller('AboutController', function (
    $scope, $rootScope,
    $ionicNavBarDelegate
) {
    $ionicNavBarDelegate.showBackButton(false);


    $scope.goToWebsite = function(){
      window.open("http://www.ateresshimon.org/index.html");
    };

    $scope.$on('$ionicView.beforeEnter', function () {
    });
})
