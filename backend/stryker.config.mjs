export default {
  packageManager: 'npm',
  reporters: ['html', 'clear-text', 'progress'],
  testRunner: 'jest',
  coverageAnalysis: 'perTest',
  mutate: ['controllers/orderController.js'],
  htmlReporter: {
    baseDir: '../reports/mutation_final',
  },
  timeoutMS: 15000,
  timeoutFactor: 1.5,
};
