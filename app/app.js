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
})
    .service("$pouchDB", ["$rootScope", "$q", function($rootScope, $q) {

      var database;
      var changeListener;

      this.setDatabase = function(databaseName) {
        database = new PouchDB(databaseName);
      }

      this.startListening = function(filter, params) {
        changeListener = database.changes({
          filter: filter,
          query_params: params,
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
