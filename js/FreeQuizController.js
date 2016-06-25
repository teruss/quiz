quizControllers.controller('FreeQuizCtrl', ['$scope', '$window', '$routeParams', '$location', 'Facebook', '$route', 'quizManager', function ($scope, $window, $routeParams, $location, Facebook, $route, quizManager) {
    quizManager.loginCallbacks = {
        success: function (user, network) {
            var ticks = quizManager.currentTicks();
            console.log("currentTicks:" + ticks);

            var user_query = KiiQuery.queryWithClause(KiiClause.and(KiiClause.equals("kind", "free"), KiiClause.lessThan("due", ticks)));
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
        var version = userCard.get("version");
        if (version >= 5) {
            $scope.$apply(function () {
                console.log("version 5 loading index:" + j);
                $scope.loading++;
                $scope.quizzes[j] = quizManager.createQuiz(null, userCard);
                if ($scope.loading == $scope.totalQuiz)
                    $scope.showLoading = false;
            });
            return;
        }
        var uri = userCard.get("quiz");
        console.log(uri);
        console.assert(uri, "uri is falsy");
        var quiz = KiiObject.objectWithURI(uri);

        quiz.refresh({
            success: function (theObject) {
                $scope.$apply(function () {
                    console.log("version 4 loading index:" + j);
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
        var nextInterval = quizManager.calcInterval(interval, due, now, good);

        if (good) {
            quiz.result = "Right!";
            console.assert($.isNumeric(quiz.numCorrectAnswers));
            quiz.numCorrectAnswers++;
            userCard.set('wrongIndices', []);
        } else {
            quiz.result = quizManager.wrongMessage(quiz);
            console.assert($.isNumeric(quiz.numWrongAnswers));

            if (quiz.kind === 'cloze') {
                var index = quizManager.wrongIndex(quiz);
                console.log("wrong index:" + index);
                quiz.numWrongAnswers++;
                var indices = userCard.get('wrongIndices');
                if (!indices) {
                    indices = [];
                }
                console.assert(indices instanceof Array);
                indices.push(index);

                userCard.set('wrongIndices', indices);
            }
        }
        quiz.next_due = quizManager.daysBetween(nextInterval);

        userCard.set("suspended", !good);
        userCard.set("due", now + nextInterval);
        userCard.set("interval", nextInterval);

        userCard.set("numCorrectAnswers", quiz.numCorrectAnswers);
        userCard.set("numWrongAnswers", quiz.numWrongAnswers);

        userCard.set("version", 4);
        userCard.set("kind", quiz.kind);
        if (quiz.kind === "cloze") {
            userCard.set("version", 5);
            userCard.set("question", quiz.answer);
            userCard.set("hint", quiz.hint);
        }
        console.assert(userCard.get("version") >= 4);
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