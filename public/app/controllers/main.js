'use strict';
angular.module('myApp').controller('MainController', function ($scope, $rootScope, $location) {

	$scope.serviceUriBase = $location.protocol() + '://' + $location.host() + ":" + $location.port();	
});