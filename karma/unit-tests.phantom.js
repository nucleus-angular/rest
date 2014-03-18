module.exports = function(config) {
  config.set({
    autoWatch: false,
    basePath: '..',
    frameworks: ['mocha', 'chai', 'sinon'],
    browsers: ['PhantomJS'],
    singleRun: true,
    preprocessors: {},
    files: [
      'components/javascript-utilities/utilities.js',
      'components/lodash/dist/lodash.js',
      'components/jquery/jquery.js',
      'components/angular/angular.js',
      'components/data-validation/data-validation.js',
      'components/angular-mocks/angular-mocks.js',
      'tests/libraries/mocker.js',
      'module.js',
      'config-provider.js',
      'schema-manager-factory.js',
      'model-factory.js',
      'repository-factory.js',
      'tests/*.js'
    ]
  });
};