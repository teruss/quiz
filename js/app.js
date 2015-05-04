var quizApp = angular.module('quizApp', [
  'ngRoute',
  'quizControllers'
]);

quizApp.config(['$routeProvider',
		function($routeProvider) {
		  $routeProvider.
		    when('/quizzes', {
		      templateUrl: 'partials/quiz-list.html',
		      controller: 'QuizCtrl'
		    }).
		    when('/create', {
		      templateUrl: 'partials/create-quiz.html',
		      controller: 'NewQuizCtrl'
		    }).
		    otherwise({
		      redirectTo: '/quizzes'
		    });
		}]);
