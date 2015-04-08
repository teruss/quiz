function init() {
  window.init();
}

window.onload = function() {
  Kii.initializeWithSite("d2e84a86", "2c41dd084726f3a409c9963646fddc22", KiiSite.JP);
};

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
