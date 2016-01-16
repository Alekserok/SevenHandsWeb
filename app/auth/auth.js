'use strict';

angular.module('myApp.auth', ['ngRoute', 'satellizer'])

    .config(function ($routeProvider, $authProvider) {
        $routeProvider
            .when('/login', {
            templateUrl: 'auth/form.html',
            controller: 'AuthCtrl'
            });
        $authProvider.linkedin({
            clientId: '77vcl3wa5f3mo2',
            url: server + '/auth/linkedin',
            authorizationEndpoint: 'https://www.linkedin.com/uas/oauth2/authorization',
            redirectUri: 'http://localhost:8000/app/index.html',
            requiredUrlParams: ['state'],
            scope: ['r_emailaddress', 'r_basicprofile', 'rw_company_admin', 'w_share'],
            scopeDelimiter: ' ',
            state: 'STATE',
            type: '2.0',
            popupOptions: {width: 527, height: 582}
        });
    })

    .controller('AuthCtrl', function ($scope, $auth, $http, $location) {

        $scope.authenticate = function (provider) {
            $auth.authenticate(provider)
                .then(function (response) {
                    $location.url('/tasks');
                })
                .catch(function (response) {
                    console.log(response.data.message)
                });
        };
    });