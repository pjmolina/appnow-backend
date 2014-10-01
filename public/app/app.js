'use strict';

// SampleBackend
angular.module('myApp', ['ngRoute', 'ngCookies', 'ui.bootstrap'])
	.config(function ($routeProvider) {
		$routeProvider
			.when('/',	                   		{ templateUrl: 'views/main.html',  controller: 'MainController' })
			.when('/login',                   	{ templateUrl: 'views/login.html',  controller: 'LoginController' })
			.when('/logout',                    { templateUrl: 'views/logout.html', controller: 'LogoutController' })
			.when('/import/:class', 			{ templateUrl: 'views/import.html', controller: 'ImportController' })

			.when('/user/list',		 { templateUrl: 'views/user/list.html',   controller: 'ListUserController' })
			.when('/user/add',        { templateUrl: 'views/user/edit.html',   controller: 'EditUserController' })
			.when('/user/edit/:id', 	 { templateUrl: 'views/user/edit.html',   controller: 'EditUserController' })
			.when('/user/delete/:id', { templateUrl: 'views/user/delete.html', controller: 'DeleteUserController' })
			.otherwise({ redirectTo: '/login' });
	})

	.constant('AUTH_EVENTS', {
	  loginSuccess: 'auth-login-success',
	  loginFailed: 'auth-login-failed',
	  logoutSuccess: 'auth-logout-success',
	  sessionTimeout: 'auth-session-timeout',
	  notAuthenticated: 'auth-not-authenticated',
	  notAuthorized: 'auth-not-authorized'
	})

	.constant('USER_ROLES', {
	  admin: 'admin'
	})

	.run( function($rootScope, $location) {
		// register listener to watch route changes
		$rootScope.$on( "$routeChangeStart", function(event, next, current) {
		  if ( $rootScope.isLogged != true  ) {
			if ( next.templateUrl == "views/login.html" ) {
			  // already going to #login, no redirect needed
			} else {
			  // not going to #login, we should redirect now (and store current ruoute for later redirect)
			  $rootScope.requestedRoute = $location.path();
			  $location.path( "/login" );
			}
		  }         
		});
	})
;


var context = '/api';
var apiDocs = '/api-docs';

var baseUrl = '';
var documentationUrl = context + apiDocs;


angular.module('myApp').value('baseUrl', baseUrl);
angular.module('myApp').value('documentationUrl', documentationUrl);
angular.module('myApp').value('baseApi', context);
