'use strict';
//, ['ngCookies']   $cookies
angular.module('myApp').controller('LoginController', function ($scope, $rootScope, $cookies, AuthService, $location) {

	$rootScope.isLogged = false;	
	$rootScope.apikey = null; 

	$scope.credentials = {
		apikey : '',
		errorMessage: null
	};
	
	$scope.login = function () {
		AuthService.login($scope.credentials)
			.then(function (user) {
				$scope.errorMessage = null;
				$rootScope.isLogged = true;
				$rootScope.apikey = $scope.credentials.apikey;
				if ($rootScope.requestedRoute) {
					var route = $rootScope.requestedRoute;
					$rootScope.requestedRoute = null;
					$location.path(route);
				} else {
					$location.path('/');
				}				
			}, function () {
				$rootScope.isLogged = false;		
				$rootScope.apikey = null;
				$scope.errorMessage = "Invalid password.";
			});
	};
	
	$scope.init = function() {
		//autologin if cookie
		if ($cookies.apikey != null && $cookies.apikey!='null') {
			$scope.credentials.apikey = $cookies.apikey;
			$scope.login(); //autologin
		}
	};
	
	$scope.init();
	  
});