import { formatPhoneNumber } from '../phone';
describe('formatPhoneNumber (dispatcher)', () => {
  it('formats correctly for phonevi rule', () => {
    expect(formatPhoneNumber('849123456789', 'phonevi')).toBe(
      '84-912-345-6789'
    );
    expect(formatPhoneNumber('0912345678', 'phonevi')).toBe('0912-345-678');
  });

  it('formats correctly for phonesg rule', () => {
    expect(formatPhoneNumber('6591234567', 'phonesg')).toBe('65-912-345-67');
    expect(formatPhoneNumber('91234567', 'phonesg')).toBe('9123-4567');
  });

  it('formats correctly for Thai (default) rule', () => {
    expect(formatPhoneNumber('021234567', '')).toBe('02-123-4567');
  });

  it('returns empty string for empty input', () => {
    expect(formatPhoneNumber('', 'phonevi')).toBe('');
  });
});
