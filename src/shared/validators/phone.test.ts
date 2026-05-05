import phone from './phone';

test('valid phone number', () => {
  const validator = phone();

  expect(validator.isValidSync('0941231238')).toBeTruthy();
});

test('empty phone number is invalid', () => {
  const validator = phone();

  expect(validator.isValidSync('')).toBeFalsy();
});

test('short phone number is invalid', () => {
  const validator = phone();

  expect(validator.isValidSync('123456789')).toBeFalsy();
});

test('long phone number is invalid', () => {
  const validator = phone();

  expect(validator.isValidSync('12345678901')).toBeFalsy();
});
