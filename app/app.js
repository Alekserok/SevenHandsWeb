'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.view2',
  'myApp.view3',
  'myApp.version',
  'satellizer'
]).
config(function($routeProvider, $authProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
  $authProvider.linkedin({
    clientId: '77vcl3wa5f3mo2',
    url: '',
    authorizationEndpoint: 'https://www.linkedin.com/uas/oauth2/authorization',
    redirectUri: 'http://localhost:8000/app/index.html',
    requiredUrlParams: ['state'],
    scope: ['r_emailaddress', 'r_basicprofile', 'rw_company_admin', 'w_share'],
    scopeDelimiter: ' ',
    state: 'STATE',
    type: '2.0',
    popupOptions: { width: 527, height: 582 }
  });
});
