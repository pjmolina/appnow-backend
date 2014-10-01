'use strict';

angular.module('myApp').service('NavigationService', function () {
	var NavigationService = {};
	
	var urlStack = [];

	NavigationService.push = function (url) {
		urlStack.push(url);
	};
	NavigationService.pop = function () {
		return urlStack.pop();
	};
	
	return NavigationService;
});
