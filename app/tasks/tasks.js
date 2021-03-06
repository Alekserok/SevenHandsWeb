'use strict';

angular.module('myApp.tasks', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/tasks', {
            templateUrl: 'tasks/tasks.html',
            controller: 'SyncTaskCtrl'
        })
            .when('/tasks/form/:id', {
                templateUrl: 'tasks/form.html',
                controller: 'SyncTaskCtrl'
            });
    }])

    .run(function($pouchDB) {
        $pouchDB.setDatabase("tasks");
        $pouchDB.sync(couch + '/tasks');
    })

    .controller("SyncTaskCtrl", function($scope, $rootScope, $pouchDB, $window, $routeParams, $http) {

        $scope.items = {};
        $scope.inputForm = {};
        $scope.user = '';

        $http({
            method: 'GET',
            url: server + '/user'
        }).then(function successCallback(res) {
            $scope.user = res.data;
        }, function errorCallback(res) {
            console.log(res);
        });

        $pouchDB.startListening('status', {status: 'published'});

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

        $scope.perform = function(documentId) {
            $pouchDB.get(documentId).then(function(result) {
                result.performer = $scope.user._id;
                result.status = 'taken';
                $scope.save(result);
            });
            $scope.go('/tasks')
        }

        $scope.clearForm = function() {
            $scope.inputForm = {};
        }

        $scope.save = function(inputForm) {
            var jsonDocument = {};

            for(var key in inputForm){
                jsonDocument[key] = inputForm[key];
            }

            $pouchDB.save(jsonDocument).then(function(response) {
                //$state.go("list");
            }, function(error) {
                console.log("ERROR -> " + error);
            });
        }

        $scope.delete = function(id, rev) {
            $pouchDB.delete(id, rev);
        }
    })

