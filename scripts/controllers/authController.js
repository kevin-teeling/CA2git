
/*
The authentication controller will call the autherntication service "authService" to perform certain tasks, 
depending on the renturn value recvied it will pop messages to the user using the angular toaster service in the index.html file
It will always first check if the user is signed in by using the "isSignedIn" function in the authService
*/

app.controller('authController', function($scope, $location, toaster, authService) // this authentication controller just needs to be passed the toaster to pop messages and the authService variable to perform authentication tasks
{
	if(authService.signedIn()) // if the user is already signed in just redirect to the home page
	{
		$location.path('/');
	}

	$scope.register = function(user) 
	{
		authService.register(user).then(
		function() 
		{
			toaster.pop('success', "You have successfully registered and are now logged in");
		}, 
		function(errorData) 
		{
			popMessage(errorData);
		});
		
		toaster.pop('info', "Attempting to register you and sign in");
		$location.path('/');
	};
	
	$scope.login = function(user) 
	{
		authService.login(user).then( 		//.then means run this task asynchronasly and continue the code, the functions in this bracket will run upon the function returning something
		function() 
		{
			toaster.pop('success', "You have successfully logged in!");
		}, 
		function(errorData) //function to be executed when the promise is rejected
		{
			popMessage(errorData);
		});
		
		toaster.pop('info', "Attempting to log in"); 	// this demonstrates how the then function will wait for a response but allow the app to continue i.e. run asynchronasly
		$location.path('/'); 							// this will redirect to the home page even while attempting to log in
	};

	$scope.changePassword = function(user) 
	{
		authService.changePassword(user).then( // uses angular promises to run the following functions after the function called ruturns something allowing the code to continue asynchronasly.. which is pretty damn cool
		function() // function to be executed when the promise is fulfilled
		{
			$scope.email = ''; // blank the data incase they try to cahnge their password again in the same session
			$scope.oldPass = '';
			$scope.newPass = '';
			toaster.pop('success', "Password changed successfully");
		}, 
		function(errorData) //function to be executed when the promise is rejected
		{
			popMessage(errorData);
		});
		
		toaster.pop('info', "Attempting to change password"); 	// this should be displayed first
		$location.path('/'); 
	};

	function popMessage(errorData) 
	{
		var errorDataor_msg = "Unknown Error...";
		if(errorData && errorData.code) // if the errorDataor that occoured returned a code
		{
			switch (errorData.code) // check the errorDataor code and change the errorDataor message string appropriatly
			{
				case "EMAIL_TAKEN": 
				errorDataor_msg = "Email address is already taken"; break;
				case "INVALID_EMAIL": 
				errorDataor_msg = "You have entered an invalid email address"; break;
				case "NETWORK_ERROR": 
				errorDataor_msg = "There was an errorDataor with the network, please try again"; break;
				case "INVALID_PASSWORD": 
				errorDataor_msg = "You have entered an invalid password"; break;
				case "INVALID_USER":
				errorDataor_msg = "That username does not exist"; break;
			} 
		}
		toaster.pop('errorDataor', errorDataor_msg);
	};
	
});
