quizControllers.controller('NewQuizCtrl', ['$scope', function ($scope) {
  $scope.createQuiz = function(quiz) {
    console.log("create quiz");
    console.log(quiz);
    var appBucket = $scope.quizBucket;
    var obj = appBucket.createObject();
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
