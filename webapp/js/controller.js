function init() {
  window.init();
}

var quizApp = angular.module('quizApp', []);

quizApp.controller('QuizCtrl', function($scope, $window) {
    $window.init= function() {
        $scope.$apply($scope.load_quiz_lib);
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

});
