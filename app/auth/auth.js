'use strict';

angular.module('myApp.auth', ['ngRoute', 'satellizer'])

    .config(function ($routeProvider, $authProvider) {
        $routeProvider.when('/auth', {
            templateUrl: 'auth/form.html',
            controller: 'AuthCtrl'
        });
        $authProvider.linkedin({
            clientId: '77vcl3wa5f3mo2',
            url: 'http://91.196.196.24:3000/auth/linkedin',
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

    .controller('AuthCtrl', function ($scope, $auth) {

        var db = new PouchDB('http://91.196.196.24:5984/tasks');

        $scope.signUp = function (email, password) {
            db.info().then(function (info) {
                console.log(info);
            })
           /* db.put({
                _id: '_design/owner',
                filters: {
                    owner: function (doc, req) {
                        return doc.owner === req.query.owner;
                    }.toString()
                }
            }).then(function(res){
                console.log('ok')
            }).catch(function (err) {
                console.log(err);
            })*/
            /*db.signup(email, password, function (err, response) {
                if (err) {
                    if (err.name === 'conflict') {
                        alert('this name is already exists')
                    } else if (err.name === 'forbidden') {
                        alert('invalid username')
                    } else {
                        alert('HTTP error, cosmic rays, etc.')
                    }
                } else {
                    alert('You successfully singed in. Login now!')
                }
            });*/
        }

        $scope.login = function (email, password) {
            db.login(email, password, function (err, response) {
                if (err) {
                    if (err.name === 'unauthorized') {
                        alert('name or password incorrect')
                    } else {
                        alert('cosmic rays, a meteor, etc.')
                    }
                }
                console.log(response);
            });
        }

        $scope.logout = function () {
            db.logout(function (err, response) {
                if (err) {
                    alert('network error')
                }
                alert('logged out')
            })
        }
        /*$scope.login = function () {
            $auth.login({email: $scope.email, password: $scope.password})
                .then(function () {

                    console.log('logged in')
                })
                .catch(function (response) {
                    console.log(response.data.message)
                });
        };*/
        $scope.authenticate = function (provider) {
            $auth.authenticate(provider)
                .then(function (response) {
                    console.log(response)
                })
                .catch(function (response) {
                    console.log(response.data.message)
                });
        };
    });