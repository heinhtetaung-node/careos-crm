import { isValidNameInput, isValidNationalId } from './customerInfo';

describe('isValidNameInput', () => {
  it('shouldnt allow number and special charater', () => {
    const result = isValidNameInput('abc12!');
    expect(result).toBe('errors.invalidData');
  });
  it('shouldnt allow max of 40 charater', () => {
    const result = isValidNameInput(
      'abccccccccccccccccccccccccccccccccccccccc'
    );
    expect(result).toBe('errors.exceedCharacters');
  });
  it('should return empty string if valid', () => {
    const result = isValidNameInput('abc');
    expect(result).toBe('');
  });
});

describe('isValidNationalId', () => {
  it('should return error if entered wrong', () => {
    const result = isValidNationalId('abc@');
    expect(result).toBe('errors.invalidID');
  });
  it('should return minCharacters error if value is shorter than 5 characters', () => {
    const result = isValidNationalId('abc');
    expect(result).toBe('errors.minCharacters');
  });
  it('should return exceedCharacters error if value is longer than 13 characters', () => {
    const result = isValidNationalId('12345678901234');
    expect(result).toBe('errors.exceedCharacters');
  });
  it('should return empty string if valid', () => {
    const result = isValidNationalId('1231231231231');
    expect(result).toBe('');
  });
});
