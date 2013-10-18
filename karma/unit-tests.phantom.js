module.exports = function(config) {
  config.set({
    autoWatch: false,
    basePath: '..',
    frameworks: ['jasmine'],
    browsers: ['PhantomJS'],
    singleRun: true,
    preprocessors: {},
    files: [
      'components/javascript-utilities/utilities.js',
      'components/lodash/dist/lodash.js',
      'components/jquery/jquery.js',
      'components/unstable-angular-complete/angular.js',
      'components/nucleus-angular-data-validation/data-validation.js',
      'components/unstable-angular-complete/angular-mocks.js',
      'tests/libraries/mocker.js',
      '*.js',
      'tests/*.js'
    ]
  });
};