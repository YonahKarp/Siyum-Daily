// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', [
    'ionic',
    'starter.controllers',
    'angularPayments',
    'ionic-timepicker',
    'ngCordova'
])

    .run(function ($ionicPlatform) {


      $ionicPlatform.ready(function () {


        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
          // org.apache.cordova.statusbar required
          StatusBar.styleDefault();
        }

        //Initialize Stripe Token.
        Stripe.setPublishableKey('pk_live_ynoOFmw1eCYUbc0mJO5ZE5dT');

      });
    })

    .config(function (
        $stateProvider,
        $urlRouterProvider,
        $ionicConfigProvider,
        $httpProvider
    ) {
        $ionicConfigProvider.navBar.alignTitle('center');
        $ionicConfigProvider.views.transition('none');
        $ionicConfigProvider.tabs.position('bottom');

        //Request Interceptor.
        //$httpProvider.interceptors.push('RequestInterceptor');

        $stateProvider
            .state('app', {
                url: '/app',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppController'
            })

            .state('app.splash', {
                url: '/splash',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/splashscreen.html',
                        controller: "SponsorController"
                    }
                }
            })

            .state('app.mymishna', {
                url: '/learning',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/learning.html',
                        controller: 'MishnaController'
                    }
                }
            })



          .state('app.tehillim', {
            url: '/learning',
            views: {
              'menuContent': {
                templateUrl: 'templates/learning.html',
                controller: 'TehillimController'
              }
            }
          })

            .state('app.settings', {
                url: '/settings',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/settings.html',
                        controller: "SettingsController"
                    }
                }
            })

            .state('app.about', {
                url: '/about',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/about.html',
                        controller: 'AboutController'
                    }
                }
            })

          .state('app.info', {
            url: '/info',
            views: {
              'menuContent': {
                templateUrl: 'templates/info.html',
                controller: 'InfoController'
              }
            }
          })

          .state('app.admin', {
            url: '/admin',
            views: {
              'menuContent': {
                templateUrl: 'templates/admin.html',
                controller: 'AdminController'
              }
            }
          })



            .state('app.share', {
                url: '/share',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/share.html',
                        controller: 'ShareController'
                    }
                }
            })


            .state('app.donate', {
                url: '/donate',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/donate.html',
                        controller: 'DonateController'
                    }
                }
            })

            .state('app.helpfeedback', {
                url: '/helpfeedback',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/help-feedback.html',
                        controller: 'HelpController'
                    }
                }
            })


          .state('app.onboarding', {
            url: '/onboarding',
            views: {
              'menuContent': {
                templateUrl: 'templates/onboarding.html',
                controller: "OnboardingController"
              }
            }
          })

            .state('signin', {
                url: '/signin',
                templateUrl: 'templates/signin.html',
                controller: 'UserController'
            })

            .state('signup', {
                url: '/signup',
                templateUrl: 'templates/signup.html',
                controller: 'UserController'
            });

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('signup');
    });
