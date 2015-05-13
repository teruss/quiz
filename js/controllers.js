var checkLoginState = function() {
  console.log("checkLoginStatus");
  FB.getLoginStatus(function(response) {
    window.checkFB(response);
  });
}

var quizControllers = angular.module('quizControllers', []);

quizControllers.controller('QuizCtrl', ['$scope', '$window', '$routeParams', '$location', 'Facebook', '$route', function($scope, $window, $routeParams, $location, Facebook, $route) {
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

  if ($routeParams.quizType == "recent") {
    $scope.quizType = "Recent Quizzes";
  } else {
    $scope.quizType = "My Quizzes";
  }
  
  var kiiInitialize = function() {
    console.log("Kii initialize");
    Kii.initializeWithSite(keys.kiiAppId, keys.kiiAppKey, KiiSite.JP);
  };

  var userIsConnected = false;

  Facebook.getLoginStatus(function(response) {
    if (response.status == 'connected') {
      userIsConnected = true;
    }

    console.log("userIsConnected?:"+userIsConnected);
    $scope.statusChangeCallback(response);
  });
  
  /**
   * IntentLogin
   */
  $scope.IntentLogin = function() {
    console.log("intentLogin:"+userIsConnected);
    if(!userIsConnected) {
      $scope.login();
    }
  };
  
  /**
   * Login
   */
  $scope.login = function() {
    console.log("login");
    Facebook.login(function(response) {
      if (response.status == 'connected') {
        $scope.isLoggedIn = true;
      }
      $scope.statusChangeCallback(response);
    });
  };  

  /**
   * Logout
   */
  $scope.logout = function() {
    Facebook.logout(function() {
      $scope.$apply(function() {
        $scope.isLoggedIn = false;
	$route.reload();
      });
    });
  }
  /**
   * Watch for Facebook to be ready.
   * There's also the event that could be used
   */
  $scope.$watch(
    function() {
      return Facebook.isReady();
    },
    function(newVal, oldVal) {
      console.log("newVal:" + newVal + "," + oldVal);
      if (newVal) {
        $scope.facebookReady = newVal;
      }
    }
  );

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
    if (response.status === 'connected') {
      console.log("kii initializing");
      kiiInitialize();
      loggedIn(response.authResponse.accessToken);
    } else if (response.status === 'not_authorized') {
      console.log('Please log into this app.');
    } else {
      console.log('Please log into this app.');
    }
  }

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
    
    var options = {
      access_token : fbAccessToken
    };
    
    console.log("try to log in with KiiSocialConnect");
    KiiSocialConnect.logIn(KiiSocialNetworkName.FACEBOOK, options, loginCallbacks);
  }

  var loginCallbacks = {
    success : function(user, network) {
      console.log("Connected user " + user + " to network: " + network);
      console.log(user);

      var accessToken = KiiUser.getCurrentUser().getAccessToken();

      var bucket = $scope.quizBucket;
      
      var ticks = $scope.currentTicks();
      
      var clause1 = KiiClause.lessThan("due", ticks);
      var clause2 = KiiClause.notEquals("suspended", true);
      var user_query = KiiQuery.queryWithClause(KiiClause.and(clause1, clause2));
      var userQueryCallbacks = {
	success: function(queryPerformed, resultSet, nextQuery) {
	  console.log(resultSet);
	  $scope.$apply(function() {
	    $scope.quizzes = resultSet;
	  });

	  for(var i=0; i<resultSet.length; i++) {
	    refreshQuiz(resultSet, i);
	  }
	  if (!nextQuery)
	    showPublicQuiz();
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

  var showPublicQuiz = function() {
    console.log("showPublicPuzzle");
    var all_query = KiiQuery.queryWithClause();
    all_query.setLimit(10);
    all_query.sortByDesc("_modified");
    var queryCallbacks = {
      success: function(queryPerformed, resultSet, nextQuery) {
	// do something with the results
	$scope.publicQuizzes = [];
	for(var i=0; i<resultSet.length; i++) {
	  // do something with the object resultSet[i];
	  $scope.$apply(function() {
	    $scope.publicQuizzes.push(createQuizFromKiiObject(resultSet[i], null));
	  });
	}
      },
      failure: function(queryPerformed, anErrorString) {
	// do something with the error response
      }
    }
    $scope.quizBucket.executeQuery(all_query, queryCallbacks);
  };

  var refreshQuiz = function(userDeck, j) {
    console.log("refreshQuiz:" + j);
    var userCard = userDeck[j];
    console.log("userCard:" + userCard);
    var uri = userCard.get("quiz");
    console.log("uri:" + uri);
    if (!uri) {
      console.log("no quiz uri");
      userCard.delete({
	success: function(theDeletedObject) {
	  console.log("Object deleted!");
	  console.log(theDeletedObject);
	},
	failure: function(theObject, errorString) {
	  console.log("Error deleting object: " + errorString);
	}
      });
      return;
    }
    var quiz = KiiObject.objectWithURI(uri);

    quiz.refresh({
      success: function(theObject) {
	console.log("Object refreshed!");
	$scope.$apply(function() {
	  $scope.quizzes[j] = createQuizFromKiiObject(theObject, userCard);
	  console.log("quiz created");
	});
      },
      failure: function(theObject, errorString) {
	console.log("Error refreshing object: " + errorString);
      }
    });
  };

  var createQuizFromKiiObject = function(theObject, userCard) {
    console.log("createQuizFormKiiObject");
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
    console.log(choices);

    var uniqueNames = [];
    $.each(choices, function(i, el){
      if(el && $.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
    });
    
    var shuffle = function() {return Math.random()-.5};
    uniqueNames.sort(shuffle);

    return {
      'question': theObject.get("question"),
      'kind': kind,
      'choices' : uniqueNames,
      'answer' : answer,
      'object' : theObject,
      'userCard' : userCard,
      'dummy1' : dummy0,
      'dummy2' : dummy1,
      'dummy3' : dummy2,
      'finished' : false
    };
  };
  
  $scope.answer = function(quiz) {
    console.log(quiz);
    var userCard = quiz.userCard;
    if (!userCard) {
      console.log("no user card");
      searchUserCard(quiz);
      return;
    }
    var due = userCard.get("due");
    console.log("due:"+due);
    var interval = userCard.get("interval");
    console.log("interval:"+interval);
    var good = quiz.answer === quiz.guess;
    var now = $scope.currentTicks()
    var nextInterval = $scope.calcInterval(interval, due, now, good);
    
    if (good) {
      quiz.result = "Right!";
    } else {
      quiz.result = "Wrong! The answer is: " + quiz.answer;
    }
    quiz.next_due = daysBetween(new Date(), $scope.dateFromTicks(now + nextInterval));
    
    userCard.set("suspended", !good);
    userCard.set("due", now + nextInterval);
    userCard.set("interval", nextInterval);

    $scope.saveUserCard(userCard);
    console.log("result:"+quiz.result);
  };

  var daysBetween = function(date1, date2) {
    console.log(date1);
    console.log(date2);
    //Get 1 day in milliseconds
    var one_day=1000*60*60*24;
    
    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;
    
    // Convert back to days and return
    return Math.round(difference_ms/one_day) + " days"; 
  };

  $scope.edit = function(quiz) {
    console.log("edit");
    $scope.quiz = angular.copy(quiz);
    $scope.master =  angular.copy(quiz);
    console.log($scope.master);
    $location.path('/create').search(quiz);
  };

  var searchUserCard = function(quiz) {
    console.log("searchUserCard");
    var clause1 = KiiClause.equals("quiz", quiz.object.objectURI());
    var user_query = KiiQuery.queryWithClause(clause1);
    var userQueryCallbacks = {
      success: function(queryPerformed, resultSet, nextQuery) {
	console.log(resultSet);
	if (resultSet.length >= 1) {
	  console.log("found user card");
	  quiz.userCard = resultSet[0];
	  $scope.$apply(function() {
	    $scope.answer(quiz);
	  });
	  return;
	}
	console.log("not found user card");
	quiz.userCard = $scope.createUserCard(quiz.object);
	$scope.answer(quiz);
      },
      failure: function(queryPerformed, anErrorString) {
	// do something with the error response
      }
    }
    
    $scope.getUserBucket().executeQuery(user_query, userQueryCallbacks);
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

  $scope.createUserCard = function(theObject) {
    var userBucket = $scope.getUserBucket();
    var userCard = userBucket.createObject();
    userCard.set("due", $scope.currentTicks());
    userCard.set("interval", 0);
    userCard.set("suspended", false);
    userCard.set("quiz", theObject.objectURI());
    return userCard;
  };
  
  $scope.quizBucket = Kii.bucketWithName("quiz");

  $scope.saveUserCard = function(userCard) {
    console.log("saveUserCard:"+userCard);

    userCard.save({
      success: function(theObject) {
	console.log("user card was saved!");
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
