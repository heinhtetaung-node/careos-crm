import { add } from 'utils/datetime';

import { formatDate, getDateFormatWithThaiYear } from './index.helper';

describe('formatDate helper', () => {
  it('should return empty string if date is invalid', () => {
    expect(formatDate('invalid date', false)).toBe('');
  });

  it('should return formatted date', () => {
    expect(formatDate('01/01/1980', false)).toBe('01/01/1980');
    expect(formatDate('12/25/1980', false)).toBe('25/12/1980');
  });

  it('should return formatted date with showThaiYear set as true', () => {
    const yearShow = add(new Date(1980, 1, 1), { years: 543 }).getFullYear();
    expect(formatDate('12/25/1980', true)).toBe(`25/12/1980(${yearShow})`);
  });
});

describe('getDateFormatWithThaiYear helper', () => {
  it('should return default format if date is undefined', () => {
    expect(getDateFormatWithThaiYear('')).toBe('dd/MM/yyyy');
  });

  it('should format with Thai year', () => {
    const yearShow = add(new Date(1980, 1, 1), { years: 543 }).getFullYear();
    expect(getDateFormatWithThaiYear('01/01/1980')).toBe(
      `dd/MM/yyyy (${yearShow})`
    );
  });
});
