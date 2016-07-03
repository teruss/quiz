'use strict';

describe('quizList', function () {

    beforeEach(module('quizApp'));
    beforeEach(module('quizList'));
    beforeEach(module('facebook'));

    describe('QuizListController', function () {
        var $httpBackend, ctrl;

        // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
        // This allows us to inject a service and assign it to a variable with the same name
        // as the service while avoiding a name conflict.
        beforeEach(inject(function ($componentController, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $httpBackend.expectGET('phones/phones.json')
                        .respond([{ name: 'Nexus S' }, { name: 'Motorola DROID' }]);

            ctrl = $componentController('quizList');
        }));

        //it('should create a `phones` property with 2 phones fetched with `$http`', function () {
        //    expect(ctrl.phones).toBeUndefined();

        //    $httpBackend.flush();
        //    expect(ctrl.phones).toEqual([{ name: 'Nexus S' }, { name: 'Motorola DROID' }]);
        //});

        //it('should set a default value for the `orderProp` property', function () {
        //    expect(ctrl.orderProp).toBe('age');
        //});

        it('should turn off hint if it is all blank', function () {
            var quiz = { 'kind': 'cloze', 'clozed': '__ __ __ _?' };
            expect(ctrl.showPreQuestion(quiz)).toBe(false);
        });

        it('should turn off hint if it is all blank in Japanese', function () {
            var quiz = { 'kind': 'cloze', 'clozed': '＿＿＿' };
            expect(ctrl.showPreQuestion(quiz)).toBe(false);
        });
    });

});
