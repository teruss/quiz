module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'webapp/bower_components/angular/angular.js',
      'webapp/bower_components/angular-route/angular-route.js',
      'webapp/bower_components/angular-mocks/angular-mocks.js',
      'webapp/js/**/*.js',
      'test/unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine'
            ],

    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
