basePath = '..';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'components/string-json-parser/string-json-parser.js',
  'components/lodash/dist/lodash.js',
  'components/jquery/jquery.js',
  'components/unstable-angular-complete/angular.js',
  'components/nucleus-angular-data-validation/data-validation.js',
  'components/unstable-angular-complete/angular-mocks.js',
  'tests/libraries/mocker.js',
  '*.js',
  'tests/*.js'
];

preprocessors = {
  '**/*.js': 'coverage'
};

reporters = ['dots', 'coverage'];

autoWatch = false;

browsers = ['PhantomJS'];

singleRun = true;