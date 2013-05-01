basePath = '..';

files = [
  JASMINE,
  JASMINE_ADAPTER,
  'components/string-json-parser/string-json-parser.js',
  'components/lodash/dist/lodash.legacy.js',
  'components/es5-shim/es5-shim.js',
  'components/unstable-angular-complete/angular.js',
  'components/unstable-angular-complete/angular-mocks.js',
  'tests/libraries/mocker.js',
  '*.js'
];

autoWatch = false;

browsers = ['IE', 'Chrome', 'Firefox', 'Opera'];

singleRun = true;
