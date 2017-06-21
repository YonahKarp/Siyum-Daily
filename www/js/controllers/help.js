"use strict";

angular.module('starter').controller('HelpController', function ($scope, $ionicNavBarDelegate) {
    $ionicNavBarDelegate.showBackButton(false);

    /*
    $scope.getStaticHelpPage = function () {
        StaticPageFactory.getStaticPageByTitle("help").success(function (data) {
            $scope.help = data.static;
        })
    };*/

    $scope.$on('$ionicView.beforeEnter', function () {
        //$scope.getStaticHelpPage();
    });
})
