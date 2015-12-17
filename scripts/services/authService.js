'use strict';

/*
The logic related to authentication and authorization (access control) is grouped together in this service:
*/

app.factory('authService', function(fb_URL, $firebaseAuth, $firebase) 
{
	var fb_ref = new Firebase(fb_URL);
	var auth = $firebaseAuth(fb_ref);
	
	var authService = {}; // create the authService service/factory variable to be use throughout the app
	
	authService.user = {}; // create the user varaible to be used throughout
	
	authService.createProfile = function(uid, user) // the register function will call this to create a user profile when regestering
	{
		var userProfile = { name: user.name, email: user.email }; // to save images with firebase requires json conversion upon storing and retriving - too much strain on the app
		var profilesRef = $firebase(fb_ref.child('profiles_db'));
		return profilesRef.$set(uid, userProfile);
	};
	
	authService.login = function(user) // called when login is clicked from navbarHeader (through the appRouter method) or called by the register function when a user is registering
	{
		return auth.$authWithPassword({email: user.email, password: user.password}); // use the firebase function to authenticate, will last untill unauth is called
	};
	
	authService.register = function(user) // called from the authControllers register function, if errors are returned they will be handled in the authControllers promise function
	{
		//first create the user using firebase's createUser function. On success, the first argument will be null, and the second argument will be an object containing attributes of the newly-created user, including the uid
		return auth.$createUser({email: user.email, password: user.password}) // this user variable will have been updated from the angular-enabled registerPage
		.then(function() // first function to run when promise returns
		{
			return authService.login(user); // authenticate first so we can write to the Firebase db
        })
        .then(function(success_data)  // second function to run when promise returns
		{
			return authService.createProfile(success_data.uid, user); // call the createProfile
        });
	};
	/*
	The two .then() handlers on the same promise will be called in the order they were attached to the promise and will both be passed the same data.
	They are just multiple watchers of the same promise kind of like two event handlers listening for the same event.
	*/
	
	authService.logout = function()
	{
		auth.$unauth();  	// Unauthenticates a Firebase reference which had previously been authenticated. 
							// When a client is unauthenticated, all callbacks attached via onAuth() will fire with a value of null. 
	};
	
	authService.changePassword = function(user) // called when login is clicked from navbarHeader (through the appRouter method)
	{
		return auth.$changePassword({email: user.email, oldPassword: user.oldPass, newPassword: user.newPass}); // Changes the password of an existing user using an email / password combination.
	};
	
	authService.signedIn = function()
	{
		return !!authService.user.provider; // !! means 0, undefined, null, etc will all = false, otherwise will = true
	};
	
	auth.$onAuth(function(authData) // uses angulars onauth to Listen for changes to the client's authentication state. i.e. listen for a user logging in or out
	{
		if(authData) // if the authdata exists then user was just logged in
		{
			angular.copy(authData, authService.user); // copy their user data to the authenticationService's user variable, to be used through out the app (if it needs updated/password changed ect..)
			authService.user.profile = $firebase(fb_ref.child('profiles_db').child(authData.uid)).$asObject(); // grab their profile and store it in the service var too
		}
		else 
		{
			if(authService.user && authService.user.profile) // if this returns null - the user has logged out blank their profile
			{
				authService.user.profile.$destroy(); // destory their profile "Always Trigger The $destroy Event Before Removing Elements In AngularJS Directives"
			}
			angular.copy({}, authService.user); // blank the user variable - now it can be used again to log into a different account , on the same session
		}
	});

	return authService;
});
