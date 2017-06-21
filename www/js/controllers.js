angular.module('starter.controllers', [])

    .controller('AppController', function($scope,
        $ionicPopup,
        $state,
        $ionicSideMenuDelegate
    ) {
        $scope.initPusher = function() {
            Pusher.log = function(message) {
                if (window.console && window.console.log) {
                }
            };

            var pusher = new Pusher('90a3fafd3e066540710b', {
                encrypted: true
            });

            var channel = pusher.subscribe('mishna_channel');
            channel.bind('mishna_events', function(data) {
                $scope.showAlert("Message from Admin", data.message);
            });
        };

        $scope.showAlert = function(title, msg) {
            var alertPopup = $ionicPopup.alert({
                title: title,
                template: msg
            });
        };

        $scope.openSideMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };


        $scope.goToSponsor = function() {
            $state.go('app.splash');
        };
    });
