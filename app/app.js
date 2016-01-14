'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.auth',
  'myApp.tasks',
  'myApp.version'
]).
config(function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/tasks'});
});
