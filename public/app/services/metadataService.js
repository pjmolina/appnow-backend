'use strict';

angular.module('myApp').service('MetadataService', function () {
	var MetadataService = {};


	var metaData = {
		"user" 		: 	["name","surname"]	};

	MetadataService.getPropertiesFor = function (className) {
		return (metaData[className] || [] ).slice(0);
	};

	return MetadataService;

});
