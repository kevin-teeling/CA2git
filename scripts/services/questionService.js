'use strict';

app.factory('questionService', function(fb_URL, $firebase) {

	var fb_ref = new Firebase(fb_URL);	

	var questionService = 
	{
		getQuestions: function(jobId) 
		{
			return $firebase(fb_ref.child('questions_db').child(jobId)).$asArray(); // get a synchronos array of questions for this job
		},

		addNewQuestion: function(jobId, question) 
		{
			var job_questions = this.getQuestions(jobId); 			// get a synchronos array of questions for this job
			question.datetime = Firebase.ServerValue.TIMESTAMP;	// get a timestamp from firebase 

			if(job_questions) // if the questions variable was successfully created add the new question
			{
				return job_questions.$add(question);	// $add will sync it to the firebase database
			}
		}
	};

	return questionService;
});
