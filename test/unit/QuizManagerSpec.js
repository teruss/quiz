/// <reference path="../../js/QuizManager.js" />
/// <reference path="../../Scripts/jquery-2.2.1.js" />
describe('QuizCtrl', function () {
    var quizManager;

    beforeEach(function () {
        quizManager = new QuizManager();
    });

    it('should return ticks from javascript datetime', function () {
        expect(quizManager.ticksFromJS(0)).toBe(621356292000000000);
    });

    it('should return readable days', function () {
        expect(quizManager.daysBetween(new Date(2015, 1, 1), new Date(2015, 1, 3))).toBe('2 days');
    });

    it('should return single type day', function () {
        expect(quizManager.daysBetween(new Date(2015, 1, 1), new Date(2015, 1, 2))).toBe('1 day');
    });

    it('should return hours if within 1 day', function () {
        expect(quizManager.daysBetween(new Date(2015, 1, 1, 0), new Date(2015, 1, 1, 23))).toBe('23 hours');
    });

    it('should return hour if within 1 hour', function () {
        expect(quizManager.daysBetween(new Date(2015, 1, 1, 0), new Date(2015, 1, 1, 1))).toBe('1 hour');
    });

    it('should return minutes if within 1 hour', function () {
        expect(quizManager.daysBetween(new Date(2015, 1, 1, 0, 0), new Date(2015, 1, 1, 0, 12))).toBe('12 minutes');
    });

    it('should return 635556672000000000 ticks if date is 2015 1 1', function () {
        expect(quizManager.ticksFromJS(new Date(2015, 0, 1))).toBe(635556672000000000);
    });

    it('should return false if quiz is null', function () {
        expect(quizManager.isValid(null)).toBe(false);
    });

    it('should return true if free quiz has question and answer', function () {
        var quiz = {};
        quiz.kind = 'free';
        quiz.choices = [];
        quiz.choices[0] = 'answer';

        expect(quizManager.isValid(quiz)).toBe(true);
    });

    it('should return false if free quiz has no answer', function () {
        var quiz = {};
        quiz.kind = 'free';
        quiz.choices = [];

        expect(quizManager.isValid(quiz)).toBe(false);
    });

    it('should return false if free quiz has no choices', function () {
        var quiz = {};
        quiz.kind = 'free';

        expect(quizManager.isValid(quiz)).toBeFalsy();
    });

    it('should return true if number quiz has number', function () {
        var quiz = {};
        quiz.kind = 'number';
        quiz.number = 1;

        expect(quizManager.isValid(quiz)).toBeTruthy();
    });

    it('should return true if quiz has answer and other dummy1', function () {
        var quiz = {};
        quiz.answer = 'answer';
        quiz.dummy1 = 'dummy1';

        expect(quizManager.isValid(quiz)).toBeTruthy();
    });

    it('should return false if quiz has no dummy1', function () {
        var quiz = {};
        quiz.answer = 'answer';
        quiz.dummy1 = '';

        expect(quizManager.isValid(quiz)).toBeFalsy();
    });

    it('should return false if quiz has same string for answer and dummy1', function () {
        var quiz = {};
        quiz.answer = 'answer';
        quiz.dummy1 = 'answer';

        expect(quizManager.isValid(quiz)).toBeFalsy();
    });

    it('should return true if cloze quiz has question and hint', function () {
        var quiz = {};
        quiz.kind = 'cloze';
        quiz.question = 'Moleskin is soft and smooth to touch.';
        quiz.hint = 'モグラの毛皮は柔らかくて手触りが滑らかだ。';

        expect(quizManager.isValid(quiz)).toBeTruthy();
    });

    it('should return false if cloze quiz has only hint', function () {
        var quiz = {};
        quiz.kind = 'cloze';
        quiz.hint = 'モグラの毛皮は柔らかくて手触りが滑らかだ。';

        expect(quizManager.isValid(quiz)).toBeFalsy();
    });

    it('should be cleared if quiz cleared', function () {
        var quiz = {};
        quiz.kind = 'cloze';
        quiz.hint = 'モグラの毛皮は柔らかくて手触りが滑らかだ。';
        quiz.question = 'question';
        quiz.answer = 'answer';
        quiz.dummy1 = 'dummy1';
        quiz.dummy2 = 'dummy2';
        quiz.dummy3 = 'dummy3';
        quiz.choices = ['c1', 'c2', 'c3', 'c4'];
        quizManager.clear(quiz);
        expect(quiz.hint).toBeFalsy();
        expect(quiz.question).toBeFalsy();
        expect(quiz.answer).toBeFalsy();
        expect(quiz.dummy1).toBeFalsy();
        expect(quiz.dummy2).toBeFalsy();
        expect(quiz.dummy3).toBeFalsy();
        for (var i = 0; i < 4; i++) {
            expect(quiz.choices[i]).toBeFalsy();
        }
    });
});
