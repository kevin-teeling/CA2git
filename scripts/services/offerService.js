'use strict';

app.factory('offerService', function(fb_URL, $firebase, $q, authService, jobService) {
	var fb_ref = new Firebase(fb_URL);
	var user = authService.user;

	var offerService = 
	{
		offers: function(jobId) 
		{
			return $firebase(fb_ref.child('offers_db').child(jobId)).$asArray();
		},

		makeOffer: function(jobId, offer) {
			var job_offers = this.offers(jobId);

			if(job_offers) {
				return job_offers.$add(offer);
			}
		},

		// chesk if the user currently logged in already made an offer
		isOfferred: function(jobId) {

			if(user && user.provider) {
				var d = $q.defer();

				$firebase(fb_ref.child('offers_db').child(jobId).orderByChild("uid")
					.equalTo(user.uid))
					.$asArray()
					.$loaded().then(function(data) {						
						d.resolve(data.length > 0);
					}, function() {
						d.reject(false);
					});

				return d.promise;
			}
		},
		
		isOfferMaker: function(offer)
		{
			return (user && user.provider && user.uid === offer.uid);
		},

		getOffer: function(jobId, offerId)
		{
			return $firebase(fb_ref.child('offers_db').child(jobId).child(offerId));
		},

		cancelOffer: function(jobId, offerId)
		{
			return this.getOffer(jobId, offerId).$remove();			
		},

		acceptOffer: function(jobId, offerId, runnerId)
		{
			var o = this.getOffer(jobId, offerId);
			return o.$update({accepted: true}) // first put offer accepted = true
			.then(function() 
			{
				var t = jobService.getJob(jobId); // then update the status of the job with "assigned"
				return t.$update({status: "assigned", runner: runnerId});
			});
		}

	};

	return offerService;

})
