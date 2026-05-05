module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  moduleDirectories: ['node_modules', 'src'],
  testEnvironment: 'node',
  testResultsProcessor: 'jest-sonar-reporter',
  testPathIgnorePatterns: ['/node_modules/'],
  setupFiles: ['<rootDir>/setup-jest.ts'],
  preset: 'ts-jest',
};
