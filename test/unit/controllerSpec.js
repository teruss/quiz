/// <reference path="../../Scripts/angular.js" />
/// <reference path="../../Scripts/angular-route.js" />
/// <reference path="../../Scripts/angular-mocks.js" />
/// <reference path="../../js/QuizManager.js" />
/// <reference path="../../js/controllers.js" />
/// <reference path="../../js/Facebook.js" />
/// <reference path="../../js/app.js" />
describe('QuizCtrl', function () {
    var scope, ctrl;
    var quizManager;

    beforeEach(module('quizApp'));

    beforeEach(inject(function ($controller, _quizManager_, $rootScope) {
        scope = $rootScope.$new();
        ctrl = $controller('QuizCtrl', {
            $scope: scope
        });

        quizManager = _quizManager_;
    }));

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

    it('should return next due if has userCard', function () {
        var quiz = {};
        quiz.object = {};
        quiz.object.objectURI = function () { };
        quiz.userCard = {};
        quiz.userCard.get = function (str) {
            return 0;
        };
        quiz.userCard.set = function (str) { };
        quiz.userCard.save = function () { };
        scope.answer(quiz);
        expect(quiz.next_due).toBe('441442 days');
    });

    it('should return 635556672000000000 ticks if date is 2015 1 1', function () {
        expect(quizManager.ticksFromJS(new Date(2015, 0, 1))).toBe(635556672000000000);
    });

});
