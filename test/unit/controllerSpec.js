describe('QuizCtrl', function() {
  var scope, ctrl;
  
  beforeEach(module('quizApp'));

  beforeEach(inject(function($controller) {
    scope = {};
    ctrl = $controller('QuizCtrl', {$scope:scope});
  }));

  it('should return 10 minutes interval if wrong answer', function() {
    expect(scope.calcInterval(1000, 0, 0, false)).toBe(600 * 1000 * 1000 * 10);
  });

  it('should return 1200 ticks if interval is 1000 and correct answer', function() {
    expect(scope.calcInterval(1000, 0, 0, true)).toBe(1200);
  });

  it('should return 1260 ticks if interval is 1000 and now is 100 and due is 0 and correct answer', function() {
    expect(scope.calcInterval(1000, 0, 100, true)).toBe(1260);
  });
});
