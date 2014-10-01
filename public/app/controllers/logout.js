'use strict';
//, ['ngCookies']   $cookies
angular.module('myApp').controller('LogoutController', function ($scope, $rootScope, $cookies, AuthService, $location) {

	$rootScope.isLogged = false;	
	$rootScope.apikey = null; 

	$scope.credentials = {
		apikey : ''
	};
		
	$scope.logout = function () {
		$scope.credentials.apikey = null;
		$cookies.apikey = null;
		AuthService.logout('');
		$location.path('/');		
	};
	
	//$scope.logout();
	  
});