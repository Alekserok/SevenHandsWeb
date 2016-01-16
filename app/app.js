'use strict';
var server = 'http://91.196.196.24:3000';
var couch = 'http://91.196.196.24:5984';
// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.view1',
    'myApp.auth',
    'myApp.tasks',
    'myApp.dashboard',
    'myApp.version'
])
    .config(function ($routeProvider, $httpProvider) {
        $routeProvider.otherwise({redirectTo: '/login'});
        $httpProvider.interceptors.push(function($q, $location) {
            return {
                'request': function(config) {
                    return config;
                },

                'responseError': function(rejection) {
                    if(rejection.status == 401 || rejection.status == 426){
                        $location.url('/login');
                    }
                    return $q.reject(rejection);
                }
            };
        });
    })
    .controller('MainCtrl', function($scope, $auth, $location) {
        $scope.getClass = function (path) {
            if ($location.path().substr(0) === path) {
                return 'active';
            } else {
                return '';
            }
        };
        $scope.logout = function() {
            $auth.logout();
        }
        $scope.go = function ( path ) {
            $location.path( path );
        };
    })
    .service("$pouchDB", ["$rootScope", "$q", function ($rootScope, $q) {

        var database;
        var changeListener;

        this.setDatabase = function (databaseName) {
            database = new PouchDB(databaseName);
        }

        this.startListening = function (filter, params) {
            changeListener = database.changes({
                filter: filter,
                query_params: params,
                live: true,
                include_docs: true
            }).on("change", function (change) {
                if (!change.deleted) {
                    $rootScope.$broadcast("$pouchDB:change", change);
                } else {
                    $rootScope.$broadcast("$pouchDB:delete", change);
                }
            });
        }

        this.stopListening = function () {
            changeListener.cancel();
        }

        this.sync = function (remoteDatabase) {
            database.sync(remoteDatabase, {live: true, retry: true});
        }

        this.save = function (jsonDocument) {
            var deferred = $q.defer();
            if (!jsonDocument._id) {
                database.post(jsonDocument).then(function (response) {
                    deferred.resolve(response);
                }).catch(function (error) {
                    deferred.reject(error);
                });
            } else {
                database.put(jsonDocument).then(function (response) {
                    deferred.resolve(response);
                }).catch(function (error) {
                    deferred.reject(error);
                });
            }
            return deferred.promise;
        }

        this.delete = function (documentId, documentRevision) {
            return database.remove(documentId, documentRevision);
        }

        this.get = function (documentId) {
            return database.get(documentId);
        }

        this.destroy = function () {
            database.destroy();
        }

    }]);
