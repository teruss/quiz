'use strict';

angular.
  module('quizDetail').
  component('quizDetail', {
      templateUrl: 'quiz-detail/quiz-detail.template.html',
      controller: ['$scope', '$routeParams', 'Facebook', 'quizManager',
          function QuizDetailController($scope, $routeParams, Facebook, quizManager) {
            Facebook.getLoginStatus(function (response) {
                if (response.status == 'connected') {
                    $scope.isLoggedIn = true;
                }
            });

            console.log("new quiz ctrl:" + $scope.isLoggedIn);

            $scope.quiz = {
                'question': '',
                'kind': 'normal',
                'choices': ['', '', '', '']
            };

            quizManager.loginCallbacks = {
                success: function (user, network) {
                    var id = $routeParams.quizId;
                    console.log("quizId:"+id);
                    if (id != "new") {
                        var object = quizManager.getUserBucket().createObjectWithID(id);
                        object.refresh({
                            success: function(userCard) {
                                $scope.$apply(function () {
                                    $scope.quiz = quizManager.createQuiz(null, userCard);
                                });
                            },
                            failure: function(userCard, errorString) {
                                console.assert(false, errorString);
                            }
                        });
                    }
                },
                // unable to connect
                failure: function (user, network, error) {
                    console.log("Unable to connect to " + network + ". Reason: " + error);
                }
            };

            $scope.createQuiz = function (quiz) {
                console.log("create quiz");
                console.log(quiz);
                var userCard = quizManager.createUserCardByQuiz(quiz);
                userCard.save({
                    success: function (theObject) {
                        quizManager.clear(quiz);
                        $scope.$apply(function () {
                            quizManager.isCreating = false;
                        });
                    },
                    failure: function (theObject, errorString) {
                        console.error(errorString);
                    }
                });
            };

            $scope.editQuiz = function (quiz) {
                var userCard0 = quiz.userCard;
                var userCard = KiiObject.objectWithURI(userCard0.objectURI());

                quizManager.updateUserCardByQuiz(quiz, userCard);

                console.log("interval0:" + userCard0.get("interval"));
                console.log("interval:" + userCard.get("interval"));
                userCard.set("due", userCard0.get("due"));
                userCard.set("interval", userCard0.get("interval"));
                console.log("interval0:" + userCard0.get("interval"));
                console.log("interval:" + userCard.get("interval"));

                userCard.saveAllFields({
                    success: function (resultUserCard) {
                        console.log("user card was updated!");
                        console.log("due:" + resultUserCard.get("due"));
                        quizManager.clear(quiz);
                        $scope.$apply(function () {
                            quizManager.isCreating = false;
                        });
                    },
                    failure: function (resultUserCard, errorString) {
                        console.error(errorString);
                    }
                });
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

            $scope.isUpdatable = function (quiz) {
                return quiz.userCard && this.isValid(quiz);
            }

            if (quizManager.isInvalid) {
                quizManager.checkStatus();
                quizManager.isInvalid = false;
            }
            quizManager.isInvalid = true;
          }
      ]
  });
