'use strict';

var app;

app = angular.module('OddJobsApp', ['ngAnimate', 'ngResource', 'ngRoute', 'firebase', 'toaster']); // load the necessary modules

app.constant('fb_URL', 'https://dazzling-heat-9279.firebaseio.com/'); // link to fb database to be used through app

app.config(function ($routeProvider) // set up the route provider to direct html display and load the apropriate controller
{
$routeProvider      
	.when('/', 					{templateUrl: 	'views/browsePage.html', 		controller: 'appController'})
	.when('/browse/:jobId',		{templateUrl: 	'views/browsePage.html', 		controller: 'appController'}) 	//if there's an id passed in the url here it will be held in the variable jobId
	.when('/registerPage', 		{templateUrl: 	'views/registerPage.html', 		controller: 'authController'})
	.when('/loginPage', 		{templateUrl: 	'views/loginPage.html', 		controller: 'authController'})
	.otherwise(					{redirectTo:	'/'});
});

