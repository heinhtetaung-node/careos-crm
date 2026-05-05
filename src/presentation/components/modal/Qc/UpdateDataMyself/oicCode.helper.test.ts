import { formatOicCodeForOrder, parseOicCodeForSelect } from './oicCode.helper';

describe('formatOicCodeForOrder', () => {
  it('returns empty string when raw is empty (covers !raw branch)', () => {
    expect(formatOicCodeForOrder('')).toBe('');
  });

  it('returns TYPE_E11 when raw is E11 (covers E11 ternary branch)', () => {
    expect(formatOicCodeForOrder('E11')).toBe('TYPE_E11');
  });

  it('returns TYPE_<raw> for numeric and other non-E11 codes (covers template branch)', () => {
    expect(formatOicCodeForOrder('110')).toBe('TYPE_110');
    expect(formatOicCodeForOrder('120')).toBe('TYPE_120');
  });
});

describe('parseOicCodeForSelect', () => {
  it('returns empty string for null (covers oicCode == null branch)', () => {
    expect(parseOicCodeForSelect(null)).toBe('');
  });

  it('returns empty string for undefined (covers null check)', () => {
    expect(parseOicCodeForSelect(undefined)).toBe('');
  });

  it('returns empty string for empty string (covers oicCode === "" branch)', () => {
    expect(parseOicCodeForSelect('')).toBe('');
  });

  it('strips leading TYPE_ from stored order value (covers replace path)', () => {
    expect(parseOicCodeForSelect('TYPE_110')).toBe('110');
    expect(parseOicCodeForSelect('TYPE_E11')).toBe('E11');
  });

  it('returns value unchanged when no TYPE_ prefix (covers String + replace with no match)', () => {
    expect(parseOicCodeForSelect('110')).toBe('110');
    expect(parseOicCodeForSelect('E11')).toBe('E11');
  });
});
