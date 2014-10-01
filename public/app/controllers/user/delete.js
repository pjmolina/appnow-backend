'use strict';

angular.module('myApp').controller('DeleteUserController', function ($scope, $routeParams, $location, UserService) {
	$scope.user = {};
	$scope.dataReceived = false;

	if($location.path() !== '/user/delete') {
		UserService.getToEdit($routeParams.id).then(function (httpResponse) {
			$scope.user = httpResponse.data;
			$scope.dataReceived = true;
		});
	} else {
		$scope.dataReceived = true;
	}

	$scope.delete = function () {
		UserService.delete($scope.user._id).then(function () {
			$location.path('/user/list');
		});
	};

	$scope.cancel = function () {
		$location.path('/user/list');
	};

});
