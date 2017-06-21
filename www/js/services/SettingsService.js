"use strict";

angular.module('starter.controllers').service('SettingsService', function($window) {

  this.setAlertTime = function(time){
    $window.localStorage.setItem('alert-time', time);
  };

  this.getAlertTime = function(){
    return $window.localStorage.getItem('alert-time');
  };


  this.setSnoozeTime = function(time){
    $window.localStorage.setItem('snooze-time', time);
  };

  this.getSnoozeTime = function(){
    return $window.localStorage.getItem('snooze-time');
  };
});
