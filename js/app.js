var quizApp = angular.module('quizApp', [
  'ngRoute',
  'quizList',
  'quizDetail',
  'cloze',
  'core',
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
              when('/edit/:quizId', {
                  template: '<quiz-detail></quiz-detail>'
              }).
              when('/cloze', {
                  template: '<cloze></cloze>'
              }).
              otherwise({
                  redirectTo: '/mode/quizzes'
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
