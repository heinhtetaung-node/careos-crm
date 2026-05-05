module.exports = {
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'jsdom',
  testResultsProcessor: 'jest-sonar-reporter',
  testPathIgnorePatterns: ['/node_modules/'],
  preset: 'ts-jest',
};
