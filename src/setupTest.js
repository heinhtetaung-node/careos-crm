import 'regenerator-runtime/runtime';
import '@testing-library/jest-dom';

import { server } from '__mocks__/server';

global.window.scrollTo = jest.fn();

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key) => key),
  getLanguage: jest.fn(() => 'en'),
  checkKeyExist: jest.fn((key) => false),
  LANGUAGES: {
    ENGLISH: 'en',
    THAI: 'th',
  },
}));

// Establish API mocking before all tests.
jest.setTimeout(100000);
beforeAll(() => {
  server.listen();
});
// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
});
// Clean up after the tests are finished.
afterAll(() => server.close());

window.HTMLElement.prototype.scrollIntoView = jest.fn();
window.newrelic = {
  noticeError: jest.fn(),
};
