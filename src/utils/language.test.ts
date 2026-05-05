import { isThai, Language } from './language';

test.each([
  ['th', true],
  ['en', false],
])('isThai %s language return %s', (lang, expectation) => {
  expect(isThai(lang as Language)).toBe(expectation);
});
