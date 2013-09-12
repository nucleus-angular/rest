basePath = '..';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'components/string-json-parser/string-json-parser.js',
  'components/lodash/dist/lodash.js',
  'components/jquery/jquery.js',
  'components/angular/angular.js',
  'components/nucleus-angular-data-validation/data-validation.js',
  'components/angular-mocks/angular-mocks.js',
  'tests/libraries/mocker.js',
  '*.js',
  'tests/*.js'
];

autoWatch = false;

reporters = ['dots'];

browsers = ['Chrome', 'Firefox', 'Safari', 'Opera'];

singleRun = true;
