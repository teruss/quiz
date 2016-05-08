quizControllers.controller('NewQuizCtrl', ['$scope', '$routeParams', 'Facebook', 'quizManager', function ($scope, $routeParams, Facebook, quizManager) {

    Facebook.getLoginStatus(function (response) {
        if (response.status == 'connected') {
            $scope.isLoggedIn = true;
        }
    });

    console.log("new quiz ctrl:" + $scope.isLoggedIn);
    $scope.quiz = quizManager.currentQuiz;
    if (!$scope.quiz) {
        $scope.quiz = {
            'question': '',
            'kind': 'normal',
            'choices': ['', '', '', '']
        };
    }
    $scope.quiz.kind = 'cloze';
    console.log($scope.quiz);
    quizManager.currentQuiz = null;
    $scope.createQuiz = function (quiz) {
        console.log("create quiz");
        console.log(quiz);
        var appBucket = quizManager.quizBucket();
        var obj = appBucket.createObject();
        saveQuiz(quiz, obj, true);
    };

    $scope.editQuiz = function (quiz) {
        console.assert(quiz.choices instanceof Array);
        var obj = quiz.object;
        saveQuiz(quiz, obj, false);
    };

    var saveQuiz = function (quiz, obj, isNew) {
        console.log("saveQuiz:" + quiz + "," + obj);
        quizManager.setParameters(quiz, obj);
        quizManager.isCreating = true;

        obj.save({
            success: function (theObject) {
                console.log("Object saved!");
                console.log(theObject);
                if (isNew) {
                    var userObject = quizManager.createUserObject();
                    var userCard = quizManager.createUserCard(theObject, userObject);
                    quizManager.saveUserCard(userCard);
                } else {
                    var userCard0 = quiz.userCard;
                    var userCard = KiiObject.objectWithURI(userCard0.objectURI());
                    quizManager.updateUserCard(theObject, userCard);
                    userCard.save({
                        success: function (resultUserCard) {
                            console.log("user card was updated!");
                            console.log("due:" + resultUserCard.get("due"));
                            console.log("quiz:" + resultUserCard.get("quiz"));
                        },
                        failure: function (resultUserCard, errorString) {
                            console.error(errorString);
                        }
                    });
                }
                quizManager.clear(quiz);
                $scope.$apply(function () {
                    quizManager.isCreating = false;
                });
            },
            failure: function (theObject, errorString) {
                console.log("Error saving object: " + errorString);
                $scope.$apply(function () {
                    quizManager.isCreating = false;
                });
            }
        });
    };

    $scope.isValid = function (quiz) {
        if (quizManager.isCreating)
            return false;
        return quizManager.isValid(quiz);
    }

    quizManager.isInvalid = true;
}]);
