'use strict';

angular.module('myApp.view1', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view1', {
            templateUrl: 'view1/view1.html',
            controller: 'TaskCtrl'
        });
    }])

    .controller('TaskCtrl', function ($scope) {

        //var db = new PouchDB('todos');
        //var remoteCouch = 'https://alekser:12345678@alekser.cloudant.com';
        //db.changes({
        //    since: 'now',
        //    live: true
        //}).on('change', showTodos);

        //function sync() {
        //    syncDom.setAttribute('data-sync-state', 'syncing');
        //    var opts = {live: true};
        //    db.replicate.to(remoteCouch, opts, syncError);
        //    db.replicate.from(remoteCouch, opts, syncError);
        //}

        function showTodos () {
            db.allDocs({include_docs: true, descending: true}, function(err, doc) {
                console.log(doc.rows);
            });
        }

        $scope.todos = [
            {text: 'learn angular', done: true},
            {text: 'build an angular app', done: false}];

        $scope.addTodo = function () {
            $scope.todos.push({text: $scope.todoText, done: false});
            $scope.todoText = '';
            var todo = {
                _id: new Date().toISOString(),
                title: $scope.todoText,
                done: false
            };
            db.put(todo, function callback(err, result) {
                if (!err) {
                    console.log($scope.showTodos);
                }
            });
        };

        $scope.remaining = function () {
            var count = 0;
            angular.forEach($scope.todos, function (todo) {
                count += todo.done ? 0 : 1;
            });
            return count;
        };

        $scope.archive = function () {
            var oldTodos = $scope.todos;
            $scope.todos = [];
            angular.forEach(oldTodos, function (todo) {
                if (!todo.done) $scope.todos.push(todo);
            });
        };
    });