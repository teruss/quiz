function init() {
  window.init();
}

window.onload = function() {
  console.log("Kii initialize");
  Kii.initializeWithSite("d2e84a86", "2c41dd084726f3a409c9963646fddc22", KiiSite.JP);
};

var quizApp = angular.module('quizApp', []);

quizApp.controller('QuizCtrl', function($scope, $window) {
  $window.init= function() {
    $scope.$apply($scope.load_quiz_lib);
  };
  
  $window.fbAsyncInit = function() {
    console.log("call facebook init");
    FB.init({
      appId      : '576444712448750',
      cookie     : true,  // enable cookies to allow the server to access 
      // the session
      xfbml      : true,  // parse social plugins on this page
      version    : 'v2.2' // use version 2.2
    });
    
    // Now that we've initialized the JavaScript SDK, we call 
    // FB.getLoginStatus().  This function gets the state of the
    // person visiting this page and can return one of three states to
    // the callback you provide.  They can be:
    //
    // 1. Logged into your app ('connected')
    // 2. Logged into Facebook, but not your app ('not_authorized')
    // 3. Not logged into Facebook and can't tell if they are logged into
    //    your app or not.
    //
    // These three cases are handled in the callback function.
    
    FB.getLoginStatus(function(response) {
      statusChangeCallback(response);
    });    
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
