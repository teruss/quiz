describe('QuizCtrl', function() {
  beforeEach(module('quizApp'));

  it('should return 10 minutes interval if wrong answer', inject(function($controller) {
    var scope = {},
	ctrl = $controller('QuizCtrl', {$scope:scope});
    expect(scope.calcInterval(1000, 0, 0, false)).toBe(600 * 1000 * 1000 * 10);
  }));
});
