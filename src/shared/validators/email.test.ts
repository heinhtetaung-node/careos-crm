import { validateEmailWithoutSpecialChars } from './email';

const validator = validateEmailWithoutSpecialChars();
test('Should valid email', () => {
  expect(validator.isValidSync('crying.now@rabbitcare.com')).toBeTruthy();
});

test('Should email not contain any unicode/special characters', () => {
  expect(validator.isValidSync('crying.nowốla@rabbitcare.com')).toBeFalsy();
});
