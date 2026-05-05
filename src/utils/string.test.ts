import { findArrayOfString } from './string';

const arrayOfString = ['abc', 'def', 'ghi'];
describe('Test findArrayOfString', () => {
  it('Should found the string in array of string', () => {
    expect(findArrayOfString(arrayOfString, 'abc')).toBe(true);
  });
  it('Should not found the string in array of string', () => {
    expect(findArrayOfString(arrayOfString, 'bbb')).toBe(false);
  });
});
