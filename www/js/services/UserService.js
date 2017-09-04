"use strict";

angular.module('starter.controllers').service('UserService', function ($window) {

  this.setLearningSelection = function (selected){
    $window.localStorage.setItem('learning-selection', selected);
  };

  this.getLearningSelection = function (){
    if ($window.localStorage.getItem('learning-selection') == null)
      return "mishnayos";

    return $window.localStorage.getItem('learning-selection');
  };

  this.setRewardsSpent = function(spent){
    $window.localStorage.setItem('rewards-spent', spent);
  };

  this.getRewardsSpent = function () {
    return $window.localStorage.getItem('rewards-spent')
  };

  this.setUserId = function (id) {
    $window.localStorage['mishna-user-id'] = id;
    $window.localStorage['isLogged'] = 1;
  };

  this.setJwtToken = function(token) {
    $window.localStorage['jwt-token'] = token;
  }

  this.getUserId = function () {
    return $window.localStorage['mishna-user-id'];
  };

  this.getJwtToken = function() {
    return $window.localStorage['jwt-token'];
  }

  this.getIsLogged = function () {
    return $window.localStorage.getItem('isLogged');
  };


  this.clearUser = function () {
    $window.localStorage['isLogged'] = 0;
    $window.localStorage['last-completed-mishna'] = '';
    $window.localStorage['last-login'] = '';
    $window.localStorage['mishna-email'] = '';
    $window.localStorage['mishna-location'] = '';
    $window.localStorage['mishna-name'] = '';
    $window.localStorage['mishna-phone'] = '';
    $window.localStorage['mishna-user-id'] = '';
  };

});
