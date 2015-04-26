var checkLoginState = function() {
  console.log("checkLoginStatus");
  FB.getLoginStatus(function(response) {
    window.checkFB(response);
  });
}

var quizApp = angular.module('quizApp', []);

quizApp.controller('QuizCtrl',['$scope', '$window', function($scope, $window) {
  var sandbox = {
    "kiiAppId":"6db83d12",
    "kiiAppKey":"df55dc77ffa451cb686cfda8f9e0fece",
    "facebookAppId" : '816805231746029'
  };
  var production = {
    "kiiAppId":"d2e84a86",
    "kiiAppKey":"2c41dd084726f3a409c9963646fddc22",
    "facebookAppId" : '576444712448750',
  }
  var keys = (document.location.hostname == "localhost") ? sandbox : production;
  
  $window.onload = function() {
    console.log("Kii initialize");
    Kii.initializeWithSite(keys.kiiAppId, keys.kiiAppKey, KiiSite.JP);
    
    (function(d, s, id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  };

  $window.checkFB = function(response) {
    console.log("fb");
    $scope.statusChangeCallback(response);
  };
  
  $window.fbAsyncInit = function() {
    console.log("call facebook init");
    FB.init({
      appId      : keys.facebookAppId,
      xfbml      : true,
      version    : 'v2.3'
    });

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
    $scope.$apply(function() {
      console.log("logged in");
      $scope.isLoggedIn = true;
    });
    FB.api('/me', function(response) {
      console.log('Successful login for: ' + response.name);
    });
    console.log("facebook token:"+ fbAccessToken);
    
    KiiSocialConnect.setupNetwork(KiiSocialNetworkName.FACEBOOK, keys.facebookAppId, null, {appId:"123"});
    
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
      var bucket = $scope.quizBucket;
      
      console.log("now:"+new Date().getTime());
      var ticks = $scope.currentTicks();
      console.log("ticks:"+ticks);
      
      // Build "user" query
      var clause1 = KiiClause.lessThan("due", ticks);
      var clause2 = KiiClause.notEquals("suspended", true);
      var user_query = KiiQuery.queryWithClause(KiiClause.and(clause1, clause2));
      var userQueryCallbacks = {
	success: function(queryPerformed, resultSet, nextQuery) {
	  console.log(resultSet);
	  $scope.$apply(function() {
	    $scope.quizzes = resultSet;
	  });
	  // do something with the results
	  for(var i=0; i<resultSet.length; i++) {
	    // do something with the object resultSet[i];
	    console.log("due js:"+$scope.dateFromTicks(resultSet[i].get("due")));
	    console.log("quiz:"+resultSet[i].get("quiz"));
	    
	    refreshQuiz(resultSet, i);
	  }
	},
	failure: function(queryPerformed, anErrorString) {
	  // do something with the error response
	}
      }

      $scope.getUserBucket().executeQuery(user_query, userQueryCallbacks);
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
	console.log(theObject.get("question"));
	var answer = theObject.get('answer');
	var kind = theObject.get('kind');
	if (!kind) {
	  kind = "normal";
	  theObject.set('kind', "normal");
	  theObject.save({
	    success: function(theObject2) {
	      console.log("Object2 saved!");
	      console.log(theObject2);
	    },
	    failure: function(theObject2, errorString2) {
	      console.log("Error saving object2: " + errorString2);
	    }
	  });
	}
	var dummy0 = theObject.get('candidate0');
	var dummy1 = theObject.get('candidate1');
	var dummy2 = theObject.get('candidate2');
	var choices = [answer, dummy0, dummy1, dummy2];
	var shuffle = function() {return Math.random()-.5};
	choices.sort(shuffle);

	$scope.$apply(function() {
	  $scope.quizzes[j] = {
	    'question': theObject.get("question"),
	    'kind': kind,
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
    var userCard = quiz.userCard;
    var due = userCard.get("due");
    console.log("due:"+due);
    var interval = userCard.get("interval");
    console.log("interval:"+interval);
    var good = quiz.answer === quiz.guess;
    var nextInterval = $scope.calcInterval(interval, due, $scope.ticksFromJS(new Date().getTime()), good);
    
    if (good) {
      quiz.result = "Right! The next due is: " + $scope.dateFromTicks(due + nextInterval);
    } else {
      quiz.result = "Wrong! The answer is: " + quiz.answer;
    }

    $scope.saveUserCard(userCard, nextInterval, due + nextInterval, !good);
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
    var epochMicrotimeDiff = 621355968000000000;
    var tickDate = new Date((ticks - epochMicrotimeDiff) / 10000);
    return tickDate;
  };

  $scope.createQuiz = function(quiz) {
    console.log("create quiz");
    console.log(quiz);
    var appBucket = $scope.quizBucket;
    var obj = appBucket.createObject();
    obj.set("question", quiz.question);
    obj.set("answer", quiz.answer);
    obj.set('candidate0', quiz.dummy1);
    obj.set('candidate1', quiz.dummy2);
    obj.set('candidate2', quiz.dummy3);
    
    obj.save({
      success: function(theObject) {
	console.log("Object saved!");
	console.log(theObject);
	var userBucket = $scope.getUserBucket();
	var userCard = userBucket.createObject();
	userCard.set("quiz", theObject.objectURI());
	userCard.set("kind", "normal");
	$scope.saveUserCard(userCard, 0, $scope.currentTicks(), false);
      },
      failure: function(theObject, errorString) {
	console.log("Error saving object: " + errorString);
      }
    });
  };
  
  $scope.quizBucket = Kii.bucketWithName("quiz");

  $scope.saveUserCard = function(userCard, interval, due, suspended) {
    console.log("saveUserCard:"+userCard+","+interval+","+due+","+suspended);

    userCard.set("interval", interval);
    userCard.set("due", due);
    userCard.set("suspended", suspended);

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

  $scope.getUserBucket = function() {
    return KiiUser.getCurrentUser().bucketWithName("quiz");
  }

  $scope.currentTicks = function() {
    return $scope.ticksFromJS(new Date().getTime());
  };
}]);
