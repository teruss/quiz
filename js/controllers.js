var checkLoginState = function () {
    console.log("checkLoginStatus");
    FB.getLoginStatus(function (response) {
        window.checkFB(response);
    });
}

var quizControllers = angular.module('quizControllers', []);

quizControllers.controller('QuizCtrl', ['$scope', '$window', '$routeParams', '$location', 'Facebook', '$route', 'quizManager', function ($scope, $window, $routeParams, $location, Facebook, $route, quizManager) {
    if ($routeParams.quizType == "recent") {
        $scope.quizType = "Recent Quizzes";
    } else {
        $scope.quizType = "My Quizzes";
    }

    quizManager.loginCallbacks = {
        success: function (user, network) {
            console.log("Connected user " + user + " to network: " + network);
            console.log(user);

            var ticks = quizManager.currentTicks();
            console.log("currentTicks:" + ticks);

            var user_query = KiiQuery.queryWithClause(KiiClause.lessThan("due", ticks));
            user_query.sortByAsc("num_wrong");
            var userQueryCallbacks = {
                success: function (queryPerformed, resultSet, nextQuery) {
                    console.log(resultSet);
                    $scope.$apply(function () {
                        $scope.quizzes = resultSet;
                    });

                    for (var i = 0; i < resultSet.length; i++) {
                        refreshQuiz(resultSet, i);
                    }
                    if (!nextQuery)
                        showPublicQuiz();
                },
                failure: function (queryPerformed, anErrorString) {
                    // do something with the error response
                }
            };

            quizManager.getUserBucket().executeQuery(user_query, userQueryCallbacks);
        },
        // unable to connect
        failure: function (user, network, error) {
            console.log("Unable to connect to " + network + ". Reason: " + error);
        }
    };

    var showPublicQuiz = function () {
        console.log("showPublicPuzzle");
        var all_query = KiiQuery.queryWithClause();
        all_query.setLimit(10);
        all_query.sortByDesc("_modified");
        var queryCallbacks = {
            success: function (queryPerformed, resultSet, nextQuery) {
                // do something with the results
                $scope.publicQuizzes = [];
                for (var i = 0; i < resultSet.length; i++) {
                    // do something with the object resultSet[i];
                    $scope.$apply(function () {
                        $scope.publicQuizzes.push(createQuizFromKiiObject(resultSet[i], null));
                    });
                }
            },
            failure: function (queryPerformed, anErrorString) {
                // do something with the error response
            }
        }
        $scope.quizBucket.executeQuery(all_query, queryCallbacks);
    };

    var refreshQuiz = function (userDeck, j) {
        console.log("refreshQuiz:" + j);
        var userCard = userDeck[j];
        console.log("userCard:" + userCard);
        var uri = userCard.get("quiz");
        console.log("uri:" + uri);
        if (!uri) {
            console.log("no quiz uri");
            userCard.delete({
                success: function (theDeletedObject) {
                    console.log("Object deleted!");
                    console.log(theDeletedObject);
                },
                failure: function (theObject, errorString) {
                    console.log("Error deleting object: " + errorString);
                }
            });
            return;
        }
        var quiz = KiiObject.objectWithURI(uri);

        quiz.refresh({
            success: function (theObject) {
                $scope.$apply(function () {
                    $scope.quizzes[j] = createQuizFromKiiObject(theObject, userCard);
                });
            },
            failure: function (theObject, errorString) {
                console.log("Error refreshing object: " + errorString);
                userCard.delete({
                    success: function (theDeletedObject) {
                        console.log("Object deleted!");
                        console.log(theDeletedObject);
                    },
                    failure: function (theObject, errorString) {
                        console.log("Error deleting object: " + errorString);
                    }
                });
            }
        });
    };

    var createQuizFromKiiObject = function (theObject, userCard) {
        console.log("createQuizFormKiiObject:" + userCard);
        console.log(theObject.get("question"));

        var kind = theObject.get('kind');
        if (!kind) {
            kind = "normal";
            theObject.set('kind', "normal");
            theObject.save({
                success: function (theObject2) {
                    console.log("Object2 saved!");
                    console.log(theObject2);
                },
                failure: function (theObject2, errorString2) {
                    console.log("Error saving object2: " + errorString2);
                }
            });
        }
        return quizManager.createQuiz(theObject, userCard);
    };

    var isGood = function (quiz) {
        console.log("isGood?");
        console.log(quiz);
        if (quiz.kind === 'normal')
            return quiz.answer === quiz.guess;
        if (quiz.kind === 'number')
            return quiz.number === quiz.guessNumber;
        console.log("ans:" + quiz.guess);
        var x = $.inArray(quiz.guess, quiz.choices) != -1;
        console.log("x:" + x);
        console.log(quiz);
        return x;
    };

    $scope.answer = function (quiz) {
        console.log(quiz);
        var userCard = quiz.userCard;
        if (!userCard) {
            console.log("no user card");
            $scope.searchUserCard(quiz);
            return;
        }
        var due = userCard.get("due");
        console.log("due:" + due);
        var interval = userCard.get("interval");
        console.log("interval:" + interval);
        var good = isGood(quiz);
        console.log("good?" + good);
        var now = quizManager.currentTicks()
        var nextInterval = $scope.calcInterval(interval, due, now, good);

        if (good) {
            quiz.result = "Right!";
        } else {
            quiz.result = wrongMessage(quiz);
        }
        quiz.next_due = quizManager.daysBetween(new Date(), quizManager.dateFromTicks(now + nextInterval));

        userCard.set("suspended", !good);
        userCard.set("due", now + nextInterval);
        userCard.set("interval", nextInterval);

        quizManager.saveUserCard(userCard);
        console.log("result:" + quiz.result);
    };

    var wrongMessage = function (quiz) {
        if (quiz.kind === 'normal')
            return "Wrong! The answer is: " + quiz.answer;
        else if (quiz.kind === 'number')
            return "Wrong! The answer is: " + quiz.number;
        else
            return "Wrong! The answer is: " + quiz.choices[0];
    };

    $scope.edit = function (quiz) {
        console.log("edit");
        quizManager.currentQuiz = quiz;
        $location.path('/create').search(quiz);
    };

    $scope.forget = function (quiz) {
        console.log("forget");
        var userCard = quiz.userCard;
        quizManager.deleteUserCard(userCard);
    };

    $scope.searchUserCard = function (quiz) {
        console.log("searchUserCard");
        var clause1 = KiiClause.equals("quiz", quiz.object.objectURI());
        var user_query = KiiQuery.queryWithClause(clause1);
        var userQueryCallbacks = {
            success: function (queryPerformed, resultSet, nextQuery) {
                console.log(resultSet);
                if (resultSet.length >= 1) {
                    console.log("found user card");
                    quiz.userCard = resultSet[0];
                    $scope.$apply(function () {
                        $scope.answer(quiz);
                    });
                    return;
                }
                console.log("not found user card");
                quiz.userCard = $scope.createUserCard(quiz.object);
                $scope.answer(quiz);
            },
            failure: function (queryPerformed, anErrorString) {
                // do something with the error response
            }
        }

        $scope.getUserBucket().executeQuery(user_query, userQueryCallbacks);
    };

    $scope.calcInterval = function (interval, due, now, good) {
        if (!good)
            return 10 * 60 * 1000 * 1000 * 10;
        var delay = now - due;
        delay *= (1 + Math.random() / 4);
        return Math.max(0, (interval + delay / 2) * 1.2);
    };

    $scope.quizBucket = Kii.bucketWithName("quiz");

    $scope.showQuiz = function (quiz) {
        return quizManager.isVisible(quiz);
    };

    $scope.invalidAnswer = function (quiz) {
        if (quiz.result)
            return true;
        if (!quiz.guess && !$.isNumeric(quiz.guessNumber))
            return true;
        return false;
    };

    if (quizManager.isInvalid) {
        quizManager.checkStatus();
        quizManager.isInvalid = false;
    }
}]);

quizControllers.controller('NavCtrl', function ($scope, $location, $route, Facebook, quizManager) {
    $scope.$watch(
        function () { return $scope.isLoggedIn },
        function (newVal, oldVal) { $scope.isLoggedIn = newVal }
    );
    var userIsConnected = false;

    quizManager.checkStatus = function () {
        Facebook.getLoginStatus(function (response) {
            if (response.status == 'connected') {
                userIsConnected = true;
            }

            console.log("userIsConnected?:" + userIsConnected);
            $scope.statusChangeCallback(response);
        });
    };
    quizManager.checkStatus();
    /**
     * IntentLogin
     */
    $scope.IntentLogin = function () {
        console.log("intentLogin:" + userIsConnected);
        if (!userIsConnected) {
            $scope.login();
        }
    };
    /**
     * Watch for Facebook to be ready.
     * There's also the event that could be used
     */
    $scope.$watch(
      function () {
          return Facebook.isReady();
      },
      function (newVal, oldVal) {
          if (newVal) {
              $scope.facebookReady = newVal;
          }
      }
    );
    $scope.logout = function () {
        Facebook.logout(function () {
            $scope.$apply(function () {
                $scope.isLoggedIn = false;
                $route.reload();
            });
        });
    };

    var sandbox = {
        "kiiAppId": "6db83d12",
        "kiiAppKey": "df55dc77ffa451cb686cfda8f9e0fece",
        "facebookAppId": '816805231746029'
    };
    var production = {
        "kiiAppId": "d2e84a86",
        "kiiAppKey": "2c41dd084726f3a409c9963646fddc22",
        "facebookAppId": '576444712448750',
    }
    var keys = (document.location.hostname == "localhost") ? sandbox : production;

    var kiiInitialize = function () {
        console.log("Kii initialize");
        Kii.initializeWithSite(keys.kiiAppId, keys.kiiAppKey, KiiSite.JP);
    };

    function loggedIn(fbAccessToken) {
        console.log('Welcome!  Fetching your information.... ');
        $scope.$apply(function () {
            console.log("logged in");
            $scope.isLoggedIn = true;
        });
        FB.api('/me', function (response) {
            console.log('Successful login for: ' + response.name);
        });
        console.log("facebook token:" + fbAccessToken);

        KiiSocialConnect.setupNetwork(KiiSocialNetworkName.FACEBOOK, keys.facebookAppId, null, { appId: "123" });

        var options = {
            access_token: fbAccessToken
        };

        console.log("try to log in with KiiSocialConnect");
        KiiSocialConnect.logIn(KiiSocialNetworkName.FACEBOOK, options, quizManager.loginCallbacks);
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

    /**
     * Login
     */
    $scope.login = function () {
        console.log("login");
        Facebook.login(function (response) {
            if (response.status == 'connected') {
                $scope.isLoggedIn = true;
            }
            $scope.statusChangeCallback(response);
        });
    };
});
