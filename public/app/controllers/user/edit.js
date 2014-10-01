'use strict';

angular.module('myApp').controller('EditUserController', function ($scope, $routeParams, $location, UserService) {
	$scope.user = {
		name : '', 
		surname : '' 
	
	};
	$scope.dataReceived = false;

	if($location.path() !== '/user/add') {
		UserService.getToEdit($routeParams.id).then(function (httpResponse) {
			$scope.user = httpResponse.data;
			$scope.dataReceived = true;
		});
	} else {
		$scope.dataReceived = true;
	}

	$scope.save = function () {
		if($location.path() === '/user/add') {
			UserService.add($scope.user).then(function () {
				$location.path('/user/list');
			});
		} else {
			UserService.update($scope.user).then(function () {
				$location.path('/user/list');
			});
		}
	};

	$scope.cancel = function () {
		$location.path('/user/list');
	};





});
