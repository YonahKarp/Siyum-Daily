/**
 * Created by YonahKarp on 6/21/17.
 */
"use strict";

angular.module('starter.controllers').service('NotificationService', function(
  SettingsService,
  $cordovaLocalNotification
) {

  var DAILY_ALERT = 0;
  var SNOOZE_ALERT = 1;
  var NUDGE_ALERT = 2;

  this.createReminder = function (time) {
    SettingsService.setAlertTime(time);

    var alarmTime = new Date();
    var parseTime = time.split(':');
    var hour = parseTime[0];
    var minute = parseTime[1];

    alarmTime.setHours(parseInt(hour));
    alarmTime.setMinutes(parseInt(minute));
    alarmTime.setSeconds(0);

    var snoozeTime = new Date();
    snoozeTime.setTime(alarmTime.getTime() + (4 * 60 * 60 * 1000));
    SettingsService.setSnoozeTime(snoozeTime.getHours() + ":" + snoozeTime.getMinutes() + ":" + "00");

    this.setAlert(DAILY_ALERT, alarmTime);
    this.setAlert(SNOOZE_ALERT, snoozeTime);
  };

  this.updateReminder = function(){
    var today = new Date();
    var alertDate = new Date();
    alertDate.setDate(today.getDate()+7);
    alertDate.setHours(12);
    alertDate.setMinutes(30);
    alertDate.setSeconds(0);
    alertDate = new Date(alertDate);

   this.updateAlert(NUDGE_ALERT, alertDate);

    var snoozeHrMin = SettingsService.getSnoozeTime().split(":");
    if(snoozeHrMin.length < 2)
      return;
    var snoozeTime = new Date();
    snoozeTime.setHours(snoozeHrMin[0],snoozeHrMin[1],0);
    snoozeTime.setDate(snoozeTime.getDate() + 1); //push off to tomorrow bc we completed

    this.setAlert(1, snoozeTime);
  };

  this.setAlert = function (id, alarmTime) {
    $cordovaLocalNotification.schedule({
      id: id,
      firstAt: alarmTime,
      message: getMessage(id),
      title: "Siyum Daily",
      every: "day",
      autoCancel: false,
      sound: 'res://platform_default'
    })
  };

  this.updateAlert = function (id, alarmTime) {
    $cordovaLocalNotification.schedule({
      id: id,
      firstAt: alarmTime,
      message: getMessage(id),
      title: "Siyum Daily",
      autoCancel: false,
      sound: 'res://platform_default'
    })
  };


  function getMessage(id) {
    switch (id) {
      case DAILY_ALERT:
        return "Learn your daily Mishna/Tehillim and be part of the collective siyum!";
      case SNOOZE_ALERT:
        return "Seems you may have forgotten to learn your daily Mishna/Tehillim! We need you to learn your daily limud to finish collectively"
      case NUDGE_ALERT:
        return "We haven't seen you in a while. Help make a daily siyum in Mishna/Tehillim!";
      default:
        return "Learn your daily Mishna/Tehillim and be part of the collective siyum!"
    }
  }


});
