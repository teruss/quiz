quizControllers.controller('NewQuizCtrl', ['$scope', '$routeParams', 'Facebook', function ($scope, $routeParams, Facebook) {
      
  Facebook.getLoginStatus(function(response) {
    if (response.status == 'connected') {
      $scope.isLoggedIn = true;
    }
  });

  console.log("new quiz ctrl:" + $scope.isLoggedIn);
  $scope.quiz = $routeParams
  $scope.reset = function() {
    $scope.quiz = $scope.master;
    console.log($scope.master);
    console.log($scope.quiz);
  };
  $scope.createQuiz = function(quiz) {
    console.log("create quiz");
    console.log(quiz);
    var appBucket = $scope.quizBucket;
    var obj = appBucket.createObject();
    saveQuiz(quiz, obj);
  };
  
  $scope.editQuiz = function(quiz) {
    console.log("edit quiz");
    console.log(quiz);
    var obj = quiz.object;
    saveQuiz(quiz, obj);
  };
  
  var saveQuiz = function(quiz, obj) {
    obj.set("question", quiz.question);
    obj.set("answer", quiz.answer);
    obj.set('candidate0', quiz.dummy1);
    obj.set('candidate1', quiz.dummy2);
    obj.set('candidate2', quiz.dummy3);
    obj.set("kind", "normal");
    $scope.isCreating = true;
    
    obj.save({
      success: function(theObject) {
	console.log("Object saved!");
	console.log(theObject);
	var userCard = $scope.createUserCard(theObject);
	
	$scope.saveUserCard(userCard);
	quiz.question = "";
	quiz.answer = "";
	quiz.dummy1 = "";
	quiz.dummy2 = "";
	quiz.dummy3 = "";
	$scope.$apply(function() {
	  $scope.isCreating = false;
	});
      },
      failure: function(theObject, errorString) {
	console.log("Error saving object: " + errorString);
	$scope.$apply(function() {
	  $scope.isCreating = false;
	});
      }
    });
  };
  
}]);
