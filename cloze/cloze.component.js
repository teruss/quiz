'use strict';

angular.
  module('cloze').
  component('cloze', {
      templateUrl: 'cloze/cloze.template.html',
      controller: ['quizManager',
          function ClozeController(quizManager) {

            console.log("cloze");

          }
      ]
  });
