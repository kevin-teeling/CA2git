'use strict';

app.factory('jobService', function(fb_URL, $firebase, authService) 
{
	var fb_ref = new Firebase(fb_URL);
	var jobs = $firebase(fb_ref.child('jobs_db')).$asArray();
	var user = authService.user;

	var jobService = 
	{
		all: jobs, // give a list of the jobs to the appControler jobs var

		getJob: function(jobId) 
		{
			return $firebase(fb_ref.child('jobs_db').child(jobId)); // return the job object
		},
		
		createJob: function(job) 
		{
			job.datetime = Firebase.ServerValue.TIMESTAMP;
			return jobs.$add(job);
		},

		editJob: function(job) 
		{
			var t = this.getJob(job.$id);			
			return t.$update({title: job.title, description: job.description, total: job.total});
		},

		cancelJob: function(jobId) 
		{
			var t = this.getJob(jobId);
			return t.$update({status: "cancelled"});
		},

		isJobCreator: function(job) 
		{
			return (user && user.provider && user.uid === job.poster);
		},

		isJobOpen: function(job) 
		{
			return job.status === "open";
		},

		isJobAssignee: function(job) 
		{
			return (user && user.provider && user.uid === job.runner);	
		},

		completeJob: function(jobId) 
		{
			var t = this.getJob(jobId);
			return t.$update({status: "completed"});
		},

		isJobCompleted: function(job) 
		{
			return job.status === "completed";
		}
	};

	return jobService;

});
