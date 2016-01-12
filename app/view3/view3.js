'use strict';

angular.module('myApp.view3', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view3', {
            templateUrl: 'view3/view3.html',
            controller: 'SyncTaskCtrl'
        });
    }])

    .run(function($pouchDB) {
        $pouchDB.setDatabase("nraboy_test");
        $pouchDB.sync("https://alekser:12345678@alekser.cloudant.com/nraboy_test");
    })

    .controller("SyncTaskCtrl", function($scope, $rootScope, $pouchDB) {

        $scope.items = {};

        $pouchDB.startListening();

        $rootScope.$on("$pouchDB:change", function(event, data) {
            $scope.items[data.doc._id] = data.doc;
            $scope.$apply();
        });

        $rootScope.$on("$pouchDB:delete", function(event, data) {
            delete $scope.items[data.doc._id];
            $scope.$apply();
        });

        if($scope.documentId) {
            $pouchDB.get($scope.documentId).then(function(result) {
                $scope.inputForm = result;
            });
        }

        $scope.save = function(firstname, lastname, email, documentId, documentRevision) {
            var jsonDocument = {
                "firstname": firstname,
                "lastname": lastname,
                "email": email
            };
            if(documentId) {
                jsonDocument["_id"] = documentId;
                jsonDocument["_rev"] = documentRevision;
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

    .service("$pouchDB", ["$rootScope", "$q", function($rootScope, $q) {

        var database;
        var changeListener;

        this.setDatabase = function(databaseName) {
            database = new PouchDB(databaseName);
        }

        this.startListening = function() {
            changeListener = database.changes({
                live: true,
                include_docs: true
            }).on("change", function(change) {
                if(!change.deleted) {
                    $rootScope.$broadcast("$pouchDB:change", change);
                } else {
                    $rootScope.$broadcast("$pouchDB:delete", change);
                }
            });
        }

        this.stopListening = function() {
            changeListener.cancel();
        }

        this.sync = function(remoteDatabase) {
            database.sync(remoteDatabase, {live: true, retry: true});
        }

        this.save = function(jsonDocument) {
            var deferred = $q.defer();
            if(!jsonDocument._id) {
                database.post(jsonDocument).then(function(response) {
                    deferred.resolve(response);
                }).catch(function(error) {
                    deferred.reject(error);
                });
            } else {
                database.put(jsonDocument).then(function(response) {
                    deferred.resolve(response);
                }).catch(function(error) {
                    deferred.reject(error);
                });
            }
            return deferred.promise;
        }

        this.delete = function(documentId, documentRevision) {
            return database.remove(documentId, documentRevision);
        }

        this.get = function(documentId) {
            return database.get(documentId);
        }

        this.destroy = function() {
            database.destroy();
        }

    }]);