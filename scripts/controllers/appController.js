'use strict';

app.controller('appController', function($scope, $routeParams, $location, toaster, jobService, authService, questionService, offerService) 
{
	$scope.searchJob = '';		
	$scope.jobs = jobService.all;

	$scope.user = authService.user;
	$scope.signedIn = authService.signedIn;

	$scope.listMode = true;
	
	if($routeParams.jobId)
	{
		var job = jobService.getJob($routeParams.jobId).$asObject(); // load the job variable with the 
		$scope.listMode = false;
		setSelectedJob(job); // set the selected job variable here from the job vaiable
	}
	
	$scope.createJob = function() 
	{	
		$scope.job.status = 'open';
		$scope.job.name = authService.user.profile.name;
		$scope.job.poster = authService.user.uid;
		
		jobService.createJob($scope.job).then(function(fb_ref)
		{
			toaster.pop('success', 'Job created successfully.');
			$scope.job = {title: '', description: '', total: '', status: 'open', name: '', poster: ''};
			$location.path('/browse/' + fb_ref.key());
		});
	};
	
	$scope.editJob = function(job) 
	{
		jobService.editJob(job).then(function()
		{			
			toaster.pop('success', "Job Updated");
		});
	};
	
	// logout function, will be called from the ng-click at the logout button in the nav.html
	$scope.logout = function()
	{
		authService.logout();
		toaster.pop('success', "You are now logged out");
		//$location.path('/');
	};
	
	// this function will set up the display for the job that was clicked
	function setSelectedJob(job)
	{
		$scope.selectedJob = job;
		
		if($scope.signedIn()) // Check if the current login user has already made an offer for selected job
		{	
			offerService.isOfferred(job.$id).then(function(data) 
			{
				$scope.alreadyOffered = data;
			});
			
			$scope.isJobCreator = jobService.isJobCreator; // Check if user currently logged in created the job selected
			$scope.isJobOpen = jobService.isJobOpen; // Check if the selected job is open
			$scope.block = false; // Unblock the Offer button on Offer modal
			
			$scope.isOfferMaker = offerService.isOfferMaker; // Check if user currently logged in made the offer (Cancel should be displayed in this case)
			$scope.isJobAssignee = jobService.isJobAssignee; // Check if user currently logged in has been assigned the selected job
			$scope.isJobCompleted = jobService.isJobCompleted; // Check if the selected Job has been completed

		}
		
		$scope.questions = questionService.getQuestions(job.$id); // Get list of questions for the selected job
		$scope.offers = offerService.offers(job.$id); // Get list of offers for the selected job
	};

	// --------------- JOB ---------------	

	$scope.cancelJob = function(jobId) 
	{
		jobService.cancelJob(jobId).then(function() 
		{
			toaster.pop('success', "This job is cancelled successfully.");
		});
	};

	$scope.completeJob = function(jobId) 
	{
		jobService.completeJob(jobId).then(function() 
		{
			toaster.pop('success', "Congratulation! You have completed this job.");
		});
	};

	// --------------- Question ---------------	

	$scope.addQuestion = function() 
	{
		var question =  // question var will be made up of the username of the person that is asking the question and the actual question - fill in from the browse.html question section - using the ng-model variable "content"
		{
			content: $scope.content,
			name: $scope.user.profile.name
		};
		
		// the question section was only available when a job was opened (selected) - pass the id of this job to the question service too
		questionService.addNewQuestion($scope.selectedJob.$id, question).then(function()  // call the question service to add the new question using the addQuestion function
		{	
			$scope.content = ''; // when it's finished adding the question blank the question variable so another variable can be added in the same session
		});
	};

	
	// --------------- OFFER ---------------

	$scope.makeOffer = function() 
	{
		var offer = 
		{
			total: $scope.total,
			uid: $scope.user.uid,			
			name: $scope.user.profile.name
		};

		offerService.makeOffer($scope.selectedJob.$id, offer).then(function() 
		{
			toaster.pop('success', "Your offer has been placed.");
			
			// Mark that the current user has offerred for this job.
			$scope.alreadyOffered = true;
			
			// Reset offer form
			$scope.total = '';

			// Disable the "Offer Now" button on the modal
			$scope.block = true;	
		});		
	};

	$scope.cancelOffer = function(offerId) 
	{
		offerService.cancelOffer($scope.selectedJob.$id, offerId).then(function() {
			toaster.pop('success', "Your offer has been cancelled.");

			// Mark that the current user has cancelled offer for this job.
			$scope.alreadyOffered = false;

			// Unblock the Offer button on Offer modal
			$scope.block = false;
		});
	};

	$scope.acceptOffer = function(offerId, runnerId) 
	{
		offerService.acceptOffer($scope.selectedJob.$id, offerId, runnerId).then(function() {
			toaster.pop('success', "Offer is accepted successfully!");

			// Mark that this Job has been assigned
			// $scope.isAssigned = true;
		});
	};


	
});
