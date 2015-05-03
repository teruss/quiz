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
		    when('/quizzes/:quizType', {
		      templateUrl: 'partials/quiz-list.html',
		      controller: 'QuizCtrl'
		    }).
		    otherwise({
		      redirectTo: '/quizzes'
		    });
		}]);
