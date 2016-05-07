var checkLoginState = function () {
    console.log("checkLoginStatus");
    FB.getLoginStatus(function (response) {
        window.checkFB(response);
    });
}

var quizControllers = angular.module('quizControllers', []);

quizControllers.controller('QuizCtrl', ['$scope', '$window', '$routeParams', '$location', 'Facebook', '$route', 'quizManager', function ($scope, $window, $routeParams, $location, Facebook, $route, quizManager) {
    quizManager.loginCallbacks = {
        success: function (user, network) {
            var ticks = quizManager.currentTicks();
            console.log("currentTicks:" + ticks);

            var user_query = KiiQuery.queryWithClause(KiiClause.lessThan("due", ticks));
            user_query.sortByDesc("version");
            user_query.setLimit(25);

            var userQueryCallbacks = {
                success: function (queryPerformed, resultSet, nextQuery) {
                    console.log(resultSet);
                    $scope.$apply(function () {
                        $scope.quizzes = resultSet;
                    });

                    $scope.loading = 0;
                    $scope.totalQuiz = resultSet.length;
                    $scope.showLoading = true;
                    for (var i = 0; i < resultSet.length; i++) {
                        refreshQuiz(resultSet, i);
                    }
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

    var refreshQuiz = function (userDeck, j) {
        var userCard = userDeck[j];
        var uri = userCard.get("quiz");
        console.assert(uri);
        var quiz = KiiObject.objectWithURI(uri);

        var version = userCard.get("version");
        if (version == 3) {
            console.assert(userCard.get("kind"));
        }

        quiz.refresh({
            success: function (theObject) {
                $scope.$apply(function () {
                    console.log("loading index:" + j);
                    $scope.loading++;
                    $scope.quizzes[j] = quizManager.createQuiz(theObject, userCard);
                    if ($scope.loading == $scope.totalQuiz)
                        $scope.showLoading = false;
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

    $scope.answer = function (quiz) {
        console.log(quiz);
        var userCard = quiz.userCard;
        console.assert(userCard);
        var due = userCard.get("due");
        var interval = userCard.get("interval");
        var good = quizManager.isCorrect(quiz);
        var now = quizManager.currentTicks()
        var nextInterval = $scope.calcInterval(interval, due, now, good);

        if (good) {
            quiz.result = "Right!";
            console.assert($.isNumeric(quiz.numCorrectAnswers));
            quiz.numCorrectAnswers++;
        } else {
            quiz.result = quizManager.wrongMessage(quiz);
            console.assert($.isNumeric(quiz.numWrongAnswers));
            quiz.numWrongAnswers++;
        }
        quiz.next_due = quizManager.daysBetween(new Date(), quizManager.dateFromTicks(now + nextInterval));

        userCard.set("suspended", !good);
        userCard.set("due", now + nextInterval);
        userCard.set("interval", nextInterval);

        userCard.set("numCorrectAnswers", quiz.numCorrectAnswers);
        userCard.set("numWrongAnswers", quiz.numWrongAnswers);

        var version = userCard.get("version");
        if (version < 3) {
            userCard.set("version", 3);
            userCard.set("kind", quiz.kind);
        }
        console.assert(userCard.get("version") == 3);
        console.assert(userCard.get("kind"));
        quizManager.saveUserCard(userCard);
        console.log("result:" + quiz.result);
    };

    $scope.edit = function (quiz) {
        console.log("edit");
        quizManager.setCurrentQuiz(quiz);
        $location.path('/create');
    };

    $scope.forget = function (quiz) {
        console.log("forget");
        var userCard = quiz.userCard;
        quizManager.deleteUserCard(userCard);
        quiz.finished = true;
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

    $scope.accuracyRate = quizManager.accuracyRate;

    if (quizManager.isInvalid) {
        quizManager.checkStatus();
        quizManager.isInvalid = false;
    }
    quizManager.isInvalid = true;
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
