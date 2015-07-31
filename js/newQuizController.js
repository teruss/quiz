quizControllers.controller('NewQuizCtrl', ['$scope', '$routeParams', 'Facebook', 'quizManager', function ($scope, $routeParams, Facebook, quizManager) {
      
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
    var appBucket = quizManager.quizBucket();
    var obj = appBucket.createObject();
    saveQuiz(quiz, obj);
  };
  
  $scope.editQuiz = function(quiz) {
    console.log("edit quiz");
    console.log(quiz);
    var obj = quiz.object;
    editQuiz(quiz, obj);
  };
  
  var setParameters = function(quiz, obj) {
    obj.set("question", quiz.question);
    if (quiz.isFreeAnswer) {
      obj.set("answers", [quiz.answer, quiz.answer1, quiz.answer2, quiz.answer3]);
      obj.set("kind", "free");      
    } else {
      obj.set("answer", quiz.answer);
      obj.set('candidate0', quiz.dummy1);
      obj.set('candidate1', quiz.dummy2);
      obj.set('candidate2', quiz.dummy3);
      obj.set("kind", "normal");
    }
    quizManager.isInvalid = true;    
  };
  
  var clearQuiz = function(quiz) {
  	quiz.question = "";
  	quiz.answer = "";
  	quiz.dummy1 = "";
  	quiz.dummy2 = "";
  	quiz.dummy3 = "";
  	quiz.answer1 = "";
  	quiz.answer2 = "";
  	quiz.answer3 = "";    
  };
  
  var saveQuiz = function(quiz, obj) {
    console.log("saveQuiz:" + quiz + "," + obj);
    setParameters(quiz, obj);
    $scope.isCreating = true;
    
    obj.save({
      success: function(theObject) {
      	console.log("Object saved!");
      	console.log(theObject);
      	var userCard = quizManager.createUserCard(theObject);
      	quizManager.saveUserCard(userCard);
        clearQuiz(quiz);
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
  
  var editQuiz = function(quiz, obj) {
    console.log("editQuiz:" + quiz + "," + obj);
    setParameters(quiz, obj);
    $scope.isCreating = true;
    
    obj.save({
      success: function(theObject) {
      	console.log("Object saved!");
      	console.log(theObject);
        clearQuiz(quiz);
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

  $scope.isValid = function(quiz) {
    if ($scope.isCreating)
      return false;
    if (quiz.isFreeAnswer)
      return !quiz.answer;
    return !quiz.answer || !quiz.dummy1 || quiz.answer === quiz.dummy1;
  }
}]);
