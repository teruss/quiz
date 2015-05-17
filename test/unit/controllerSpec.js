describe('QuizCtrl', function() {
  var scope, ctrl;
  var quizManager;

  beforeEach(module('quizApp'));

  beforeEach(inject(function($controller, _quizManager_, $rootScope) {
    scope = $rootScope.$new();
    ctrl = $controller('QuizCtrl', {
      $scope:scope
    });
    
    quizManager = _quizManager_;
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

  it('should never return negative ticks', function() {
    expect(scope.calcInterval(-1000, 0, 100, true)).toBe(0);
  });

  it('should return ticks from javascript datetime', function() {
    expect(quizManager.ticksFromJS(0)).toBe(621355968000000000);
  });

  it('should return readable days', function() {
    expect(quizManager.daysBetween(new Date(2015, 1, 1), new Date(2015, 1, 3))).toBe('2 days');
  });

  it('should return single type day', function() {
    expect(quizManager.daysBetween(new Date(2015, 1, 1), new Date(2015, 1, 2))).toBe('1 day');
  });

  it('should return hours if within 1 day', function() {
    expect(quizManager.daysBetween(new Date(2015, 1, 1, 0), new Date(2015, 1, 1, 23))).toBe('23 hours');
  });

  it('should return hour if within 1 hour', function() {
    expect(quizManager.daysBetween(new Date(2015, 1, 1, 0), new Date(2015, 1, 1, 1))).toBe('1 hour');
  });

  it('should return minutes if within 1 hour', function() {
    expect(quizManager.daysBetween(new Date(2015, 1, 1, 0, 0), new Date(2015, 1, 1, 0, 12))).toBe('12 minutes');
  });

  it('should return next due', function() {
    var quiz = {};
    quiz.object = {};
    quiz.object.objectURI = function(){};
    scope.searchUserCard = function(quiz) {
      quiz.next_due = 100;
    };
    scope.answer(quiz);
    expect(quiz.next_due).toBe(100);
  });

  it('should return next due if has userCard', function() {
    var quiz = {};
    quiz.object = {};
    quiz.object.objectURI = function(){};
    quiz.userCard = {};
    quiz.userCard.get = function(str) {
      return 0
    };
    quiz.userCard.set = function(str) {};
    quiz.userCard.save = function() {};
    scope.answer(quiz);
    expect(quiz.next_due).toBe('441440 days');
  });
});
