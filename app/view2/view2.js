'use strict';

angular.module('myApp.view2', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view2', {
    templateUrl: 'view2/view2.html',
    controller: 'View2Ctrl'
  });
}])

.controller('View2Ctrl', function($scope, $auth) {

      $scope.login = function() {
        $auth.login({ email: $scope.email, password: $scope.password })
            .then(function() {

              console.log('logged in')
            })
            .catch(function(response) {
              console.log(response.data.message)
            });
      };
      $scope.authenticate = function(provider) {
        $auth.authenticate(provider)
            .then(function(response){
              console.log(response)
            })
            .catch(function(response) {
              console.log(response.data.message)
            });
      };
});