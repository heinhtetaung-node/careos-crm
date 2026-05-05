module.exports = {
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/'],

  modulePathIgnorePatterns: [
    '<rootDir>/build',
    '<rootDir>/src/presentation/components/LeadDetails/ProvinceSelector/__mocks__/index.tsx',
  ],

  moduleDirectories: ['node_modules', 'src'],

  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>src/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|png)$': '<rootDir>src/__mocks__/fileMock.js',
    '\\.svg\\?react$': '<rootDir>src/__mocks__/svgrMock.js',
    '\\.svg$': '<rootDir>src/__mocks__/svgStrMock.js',
  },

  setupFilesAfterEnv: [
    '<rootDir>src/setupTestEnv.js',
    '<rootDir>src/setupTest.js',
  ],

  testEnvironment: '<rootDir>/jsdom-extended.js',
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  testResultsProcessor: 'jest-sonar-reporter',

  testPathIgnorePatterns: [
    '/node_modules/',
    '/src/__tests__/test-utils.tsx',
    '/src/__tests__/rtl-test-utils.tsx',
    '/src/__tests__/rtl-store.ts',
    '/src/__tests__/i18n-context.ts',
  ],
  transformIgnorePatterns: ['node_modules/(?!uuid)/'],
  transform: {
    '^.+\\.(js|jsx|mjs)$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            jsx: true,
          },
        },
      },
    ],
    '^.+\\.(ts|tsx)$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
          },
        },
      },
    ],
  },

  maxWorkers: 2,
  workerIdleMemoryLimit: '512MB',
};
