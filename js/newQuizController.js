quizControllers.controller('NewQuizCtrl', ['$scope', '$routeParams', 'Facebook', 'quizManager', function ($scope, $routeParams, Facebook, quizManager) {
      
  Facebook.getLoginStatus(function(response) {
    if (response.status == 'connected') {
      $scope.isLoggedIn = true;
    }
  });

  console.log("new quiz ctrl:" + $scope.isLoggedIn);  
  $scope.quiz = quizManager.currentQuiz;
  if (!$scope.quiz) {
    $scope.quiz = {
      'question' : '',
      'kind' : 'normal',
      'choices' : ['', '', '', '']
    };
  }
  console.log($scope.quiz);
  quizManager.currentQuiz = null;
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
  
  var clearQuiz = function(quiz) {
  	quiz.question = "";
  	quiz.answer = "";
  	quiz.dummy1 = "";
  	quiz.dummy2 = "";
  	quiz.dummy3 = "";
    for (var i = 0; i < 4; i++)
      quiz.choices[i] = "";
    quiz.number = "";
  };
  
  var saveQuiz = function(quiz, obj) {
    console.log("saveQuiz:" + quiz + "," + obj);
    quizManager.setParameters(quiz, obj);
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
    quizManager.setParameters(quiz, obj);
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
    if (!quiz)
      return false;
    if (quiz.kind === 'free') {
      if (!quiz.choices || !quiz.choices[0])
        return false;
      return true;
    }
    if (quiz.kind === 'number') {
      return quiz.number;
    }
    return quiz.answer && quiz.dummy1 && quiz.answer != quiz.dummy1;
  }

  quizManager.isInvalid = true;    
}]);
