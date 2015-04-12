// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
  console.log('statusChangeCallback');
  console.log(response);
  // The response object is returned with a status field that lets the
  // app know the current login status of the person.
  // Full docs on the response object can be found in the documentation
  // for FB.getLoginStatus().
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    loggedIn(response.authResponse.accessToken);
  } else if (response.status === 'not_authorized') {
    // The person is logged into Facebook, but not your app.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into this app.';
  } else {
    // The person is not logged into Facebook, so we're not sure if
    // they are logged into this app or not.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into Facebook.';
  }
}

// This function is called when someone finishes with the Login
// Button.  See the onlogin handler attached to it in the sample
// code below.
function checkLoginState() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}

window.fbAsyncInit = function() {
  console.log("call facebook init");
  FB.init({
    appId      : '576444712448750',
    cookie     : true,  // enable cookies to allow the server to access 
    // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.2' // use version 2.2
  });

  // Now that we've initialized the JavaScript SDK, we call 
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });

};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function loggedIn(fbAccessToken) {
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    console.log('Successful login for: ' + response.name);
    document.getElementById('status').innerHTML =
      'Thanks for logging in, ' + response.name + '!';
  });

  console.log("facebook token:"+ fbAccessToken);

  // SNS Registration
  var loginCallbacks = {
    // successfully connected to Facebook
    success : function(user, network) {
      console.log("Connected user " + user + " to network: " + network);
      console.log(user);
      // Get an access token by getAccessToekn method.
      var accessToken = KiiUser.getCurrentUser().getAccessToken();
      console.log("accessToken:"+accessToken);

      // Prepare the target bucket to be queried
      var bucket = Kii.bucketWithName("quiz");
      
      // Build "all" query
      var all_query = KiiQuery.queryWithClause();
      
      // Define the callbacks
      var queryCallbacks = {
	success: function(queryPerformed, resultSet, nextQuery) {
	  console.log(resultSet);
	  // do something with the results
	  for(var i=0; i<resultSet.length; i++) {
	    // do something with the object resultSet[i];
	    console.log("result:"+resultSet[i].get("question"));
	  }
	  if(nextQuery != null) {
	    // There are more results (pages).
	    // Execute the next query to get more results.
//	    bucket.executeQuery(nextQuery, queryCallbacks);
	  }
	},
	failure: function(queryPerformed, anErrorString) {
	  // do something with the error response
	}
      }
      
      // Execute the query
      bucket.executeQuery(all_query, queryCallbacks);

      console.log("now:"+new Date().getTime());
      var ticks = ((new Date().getTime() * 10000) + 621355968000000000);
      console.log("ticks:"+ticks);
      
      // Build "all" query
      var user_query = KiiQuery.queryWithClause();
      // Prepare the target Bucket to be queried.
      var userBucket = KiiUser.getCurrentUser().bucketWithName("quiz");
      var userQueryCallbacks = {
	success: function(queryPerformed, resultSet, nextQuery) {
	  console.log(resultSet);
	  // do something with the results
	  for(var i=0; i<resultSet.length; i++) {
	    // do something with the object resultSet[i];
	    console.log("due:"+resultSet[i].get("due"));
	    console.log("quiz:"+resultSet[i].get("quiz"));
	  }
	  if(nextQuery != null) {
	    // There are more results (pages).
	    // Execute the next query to get more results.
//	    bucket.executeQuery(nextQuery, queryCallbacks);
	  }
	},
	failure: function(queryPerformed, anErrorString) {
	  // do something with the error response
	}
      }

      userBucket.executeQuery(all_query, userQueryCallbacks);
    },
    // unable to connect
    failure : function(user, network, error) {
      console.log("Unable to connect to " + network + ". Reason: " + error);
    }
  };
  
  KiiSocialConnect.setupNetwork(KiiSocialNetworkName.FACEBOOK, "123", null, {appId:"123"});
  
  // set options required by Facebook's API, you should also get the fbAccessToken 
  var options = {
    access_token : fbAccessToken
  };
  
  // this method must be after KiiSocialConnect.setupNetwork
  console.log("try to log in with KiiSocialConnect");
  KiiSocialConnect.logIn(KiiSocialNetworkName.FACEBOOK, options, loginCallbacks);
  // this method must be after KiiSocialConnect.setupNetwork
//KiiSocialConnect.linkCurrentUserWithNetwork(KiiSocialNetworkName.FACEBOOK, options, loginCallbacks);
}
