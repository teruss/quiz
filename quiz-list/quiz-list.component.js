angular.
    module('quizList').
    component('quizList', {
        template: 'TBD: List view for <span>{{$ctrl.modeId}}<span>',
        controller: ['$routeParams',
            function QuizListController($routeParams) {
                this.modeId = $routeParams.modeId;
            }
        ]
    });
