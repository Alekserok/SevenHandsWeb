'use strict';

angular.module('myApp.dashboard', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/dashboard', {
                templateUrl: 'dashboard/dashboard.html',
                controller: 'DashboardCtrl'
            })
            .when('/dashboard/form/:id', {
                templateUrl: 'dashboard/form.html',
                controller: 'DashboardCtrl'
            })
            .when('/dashboard/:taken', {
                templateUrl: 'dashboard/dashboard.html',
                controller: 'DashboardCtrl'
            });
    }])

    .run(function($pouchDB) {
        $pouchDB.setDatabase("tasks");
        $pouchDB.sync(couch + '/tasks');
    })

    .controller("DashboardCtrl", function($scope, $rootScope, $pouchDB, $window, $routeParams, $http, $location) {

        console.log($routeParams.taken);
        $scope.items = {};
        $scope.inputForm = {};
        $scope.user = '';

        $http({
            method: 'GET',
            url: server + '/user'
        }).then(function successCallback(res) {
            $scope.user = res.data;
            if($routeParams.taken){
                $pouchDB.startListening('performer', {performer: $scope.user._id});
            } else {
                $pouchDB.startListening('owner', {owner: $scope.user._id});
            }

        }, function errorCallback(res) {
            console.log(res);
        });



        $rootScope.$on("$pouchDB:change", function(event, data) {
            $scope.items[data.doc._id] = data.doc;
            $scope.$apply();
        });

        $rootScope.$on("$pouchDB:delete", function(event, data) {
            delete $scope.items[data.doc._id];
            $scope.$apply();
        });

        if($routeParams.id){
            $pouchDB.get($routeParams.id).then(function(result) {
                $scope.inputForm = result;
                $scope.$apply();
            });
        }
        $scope.edit = function(documentId) {
            $pouchDB.get(documentId).then(function(result) {
                $scope.inputForm = result;
                $scope.$apply();
            });
            $window.scrollTo(0, 0);
        }

        $scope.clearForm = function() {
            $scope.inputForm = {};
        }

        $scope.save = function(inputForm) {
            var jsonDocument = {};

            for(var key in inputForm){
                jsonDocument[key] = inputForm[key];
            }

            jsonDocument['owner'] = $scope.user._id;

            $pouchDB.save(jsonDocument).then(function(response) {
                //$state.go("list");
            }, function(error) {
                console.log("ERROR -> " + error);
            });
            $location.url('/dashboard');
        }

        $scope.delete = function(id, rev) {
            $pouchDB.delete(id, rev);
        }
    })



