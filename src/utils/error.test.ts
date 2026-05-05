import { getErrorMessageFromErrorObj } from './error';

test('should return message if the errorObj is not structured', () => {
  const result = getErrorMessageFromErrorObj({
    code: 500,
    message: 'Error message',
  });
  expect(result).toBe('Error message');
});

test('should return structured message if the errorObj is structured', () => {
  const result = getErrorMessageFromErrorObj({
    code: 500,
    errors: {
      field1: ['required'],
      field2: ['required'],
    },
    message: 'Error message',
  });
  expect(result).toBe('field1 : required\nfield2 : required');
});
