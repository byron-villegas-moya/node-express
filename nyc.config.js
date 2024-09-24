module.exports = {
  exclude: [
    'index.js',
    '.mocharc.js',
    'nyc.config.js',
    'coverage',
    'cucumber.js',
    'artillery/processor.js',
    'acceptance-test',
    'jmeter-result',
    'test'
  ],
  all: true,
  checkCoverage: true,
  reporter: ['text-summary','html','cobertura'],
  branches: 90,
  functions: 90,
  lines: 90,
  statements: 90
}