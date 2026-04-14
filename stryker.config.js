/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
module.exports = {
  mutate: [
    'src/**/*.js',
    '!src/utils/constants.js'
  ],
  testRunner: 'jest',
  jest: {
    configFile: 'jest.config.js'
  },
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  thresholds: {
    high: 80,
    low: 60,
    break: 50
  },
  timeoutMS: 10000,
  concurrency: 4
};
