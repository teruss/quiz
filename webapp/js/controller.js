function init() {
  window.init();
}

window.onload = function() {
  console.log("Kii initialize");
  Kii.initializeWithSite("d2e84a86", "2c41dd084726f3a409c9963646fddc22", KiiSite.JP);
};

var quizApp = angular.module('quizApp', []);

quizApp.controller('QuizCtrl',['$scope', '$window', function($scope, $window) {
  $window.init= function() {
    $scope.$apply($scope.load_quiz_lib);
    $scope.$apply($scope.statusChangeCallback);
  };
  
  $window.fbAsyncInit = function() {
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
      $scope.statusChangeCallback(response);
    });
  };
  
  $scope.load_quiz_lib = function() {
  };

  $scope.insert = function() {
    quiz = {
      "question" : $scope.question,
      "answer" : $scope.answer,
      "dummy1" : $scope.dummy1,
      "dummy2" : $scope.dummy2,
      "dummy3" : $scope.dummy3
    }

  }

  $scope.list = function() {
  }

  // This is called with the results from from FB.getLoginStatus().
  $scope.statusChangeCallback = function (response) {
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
    
    KiiSocialConnect.setupNetwork(KiiSocialNetworkName.FACEBOOK, "123", null, {appId:"123"});
    
    // set options required by Facebook's API, you should also get the fbAccessToken 
    var options = {
      access_token : fbAccessToken
    };
    
    // this method must be after KiiSocialConnect.setupNetwork
    console.log("try to log in with KiiSocialConnect");
    KiiSocialConnect.logIn(KiiSocialNetworkName.FACEBOOK, options, loginCallbacks);
  }

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
      
      console.log("now:"+new Date().getTime());
      var ticks = $scope.ticksFromJS(new Date().getTime());
      console.log("ticks:"+ticks);
      
      // Build "user" query
      var clause1 = KiiClause.lessThan("due", ticks);
      var clause2 = KiiClause.notEquals("suspended", true);
      var user_query = KiiQuery.queryWithClause(KiiClause.and(clause1, clause2));
      // Prepare the target Bucket to be queried.
      var userBucket = KiiUser.getCurrentUser().bucketWithName("quiz");
      var userQueryCallbacks = {
	success: function(queryPerformed, resultSet, nextQuery) {
	  console.log(resultSet);
	  $scope.$apply(function() {
	    $scope.quizzes = resultSet;
	  });
	  // do something with the results
	  for(var i=0; i<resultSet.length; i++) {
	    // do something with the object resultSet[i];
	    console.log("due:"+resultSet[i].get("due"));
	    console.log("due js:"+$scope.dateFromTicks(resultSet[i].get("due")));
	    console.log("quiz:"+resultSet[i].get("quiz"));
	    
	    refreshQuiz(resultSet, i);
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

      userBucket.executeQuery(user_query, userQueryCallbacks);
    },
    // unable to connect
    failure : function(user, network, error) {
      console.log("Unable to connect to " + network + ". Reason: " + error);
    }
  };

  var refreshQuiz = function(userDeck, j) {
    var userCard = userDeck[j];
    var uri = userCard.get("quiz");
    var quiz = KiiObject.objectWithURI(uri);

    quiz.refresh({
      success: function(theObject) {
	console.log("Object refreshed!");
	console.log(theObject);
	console.log(theObject.get("question"));
	var answer = theObject.get('answer');
	var dummy0 = theObject.get('candidate0');
	var dummy1 = theObject.get('candidate1');
	var dummy2 = theObject.get('candidate2');
	var choices = [answer, dummy0, dummy1, dummy2];
	var shuffle = function() {return Math.random()-.5};
	choices.sort(shuffle);

	$scope.$apply(function() {
	  $scope.quizzes[j] = {
	    'question': theObject.get("question"),
	    'choices' : choices,
	    'answer' : answer,
	    'object' : theObject,
	    'userCard' : userCard
	  };
	});
      },
      failure: function(theObject, errorString) {
	console.log("Error refreshing object: " + errorString);
      }
    });
  };

  $scope.answer = function(quiz) {
    console.log(quiz);
    var obj = quiz.object;
    var userCard = quiz.userCard;
    var due = userCard.get("due");
    console.log("due:"+due);
    var interval = userCard.get("interval");
    console.log("interval:"+interval);
    var good = quiz.answer === quiz.guess;
    var nextInterval = $scope.calcInterval(interval, due, $scope.ticksFromJS(new Date().getTime()), good);
    userCard.set("interval", nextInterval);
    userCard.set("due", due + nextInterval);
    userCard.set("suspended", !good);

    if (good) {
      quiz.result = "Right!";
    } else {
      quiz.result = "Wrong! The answer is: " + quiz.answer;
    }
    userCard.save({
      success: function(theObject) {
	console.log("Object saved!");
	console.log(theObject);
	console.log("due:"+theObject.get("due"));
	console.log("quiz:"+theObject.get("quiz"));
	var ticks = theObject.get("due");
	var tickDate = $scope.dateFromTicks(ticks)
	console.log("next:"+tickDate);
      },
      failure: function(theObject, errorString) {
	console.log("Error saving object: " + errorString);
      }
    });
  };
  
  $scope.calcInterval = function(interval, due, now, good) {
    if (!good)
      return 10 * 60 * 1000 * 1000 * 10;
    var delay = now - due;
    return Math.max(0, (interval + delay / 2) * 1.2);
  };

  $scope.ticksFromJS = function(time) {
    return (time * 10000) + 621355968000000000;
  };

  $scope.dateFromTicks = function(ticks) {
    //ticks are in nanotime; convert to microtime
    var ticksToMicrotime = ticks / 10000;
    
    //ticks are recorded from 1/1/1; get microtime difference from 1/1/1/ to 1/1/1970
    var epochMicrotimeDiff = 621355968000000000;
    
    //new date is ticks, converted to microtime, minus difference from epoch microtime
    var tickDate = new Date((ticks - epochMicrotimeDiff) / 10000);
    return tickDate;
  };
}]);
