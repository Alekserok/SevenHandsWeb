'use strict';

angular.module('myApp.tasks', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/tasks', {
            templateUrl: 'tasks/tasks.html',
            controller: 'SyncTaskCtrl'
        })
            .when('/form/:id', {
                templateUrl: 'tasks/form.html',
                controller: 'SyncTaskCtrl'
            });
    }])

    .run(function($pouchDB) {
        $pouchDB.setDatabase("tasks");
        $pouchDB.sync('http://91.196.196.24:5984/tasks');
    })

    .controller("SyncTaskCtrl", function($scope, $rootScope, $pouchDB, $window, $routeParams) {

        $scope.items = {};
        $scope.inputForm = {};

        $pouchDB.startListening('owner', {owner: 'alex'});
        $pouchDB.startListening('status', {status: 'new'});

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

            $pouchDB.save(jsonDocument).then(function(response) {
                //$state.go("list");
            }, function(error) {
                console.log("ERROR -> " + error);
            });
            $scope.clearForm();
        }

        $scope.delete = function(id, rev) {
            $pouchDB.delete(id, rev);
        }
    })

