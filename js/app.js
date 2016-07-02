var quizApp = angular.module('quizApp', [
  'ngRoute',
  'quizControllers',
  'quizList',
  'facebook'
]);

angular.
    module('quizApp').
    config(['$routeProvider', 'FacebookProvider',
		function config($routeProvider, FacebookProvider) {
		    $routeProvider.
                when('/mode/:modeId', {
                    template: '<quiz-list></quiz-list>'
                }).
              when('/quizzes', {
                  templateUrl: 'partials/quiz-list.html',
                  controller: 'QuizCtrl'
              }).
              when('/cloze-quizzes', {
                  templateUrl: 'partials/quiz-list.html',
                  controller: 'ClozeQuizCtrl'
              }).
              when('/choice-quizzes', {
                  templateUrl: 'partials/quiz-list.html',
                  controller: 'ChoiceQuizCtrl'
              }).
              when('/not-choice-quizzes', {
                  templateUrl: 'partials/quiz-list.html',
                  controller: 'NotChoiceQuizCtrl'
              }).
              when('/free-quizzes', {
                  templateUrl: 'partials/quiz-list.html',
                  controller: 'FreeQuizCtrl'
              }).
              when('/create', {
                  templateUrl: 'partials/create-quiz.html',
                  controller: 'NewQuizCtrl'
              }).
              otherwise({
                  //redirectTo: '/r-test'
                  redirectTo: '/quizzes'
              });

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

		    console.log("init:" + keys.facebookAppId);
		    FacebookProvider.init(keys.facebookAppId);
		}
    ]);

quizApp.service('quizManager', QuizManager);
