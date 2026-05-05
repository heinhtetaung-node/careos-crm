module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],
  modulePathIgnorePatterns: ['<rootDir>/build'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>src/__mocks__/styleMock.js',
  },
  testEnvironment: 'jest-environment-jsdom',
  testResultsProcessor: 'jest-sonar-reporter',
  testPathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/src/__mocks__/*.js',
    '<rootDir>/dist',
  ],
  preset: 'ts-jest',
};
