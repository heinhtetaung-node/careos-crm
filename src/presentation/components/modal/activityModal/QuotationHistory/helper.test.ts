import { displayTimestamp } from './helper';

describe('displayTimestamp', () => {
  it('returns the correct format', () => {
    const value = new Date('1 January 1970');
    const result = displayTimestamp({ value });
    expect(result).toEqual('01/01/1970 (12:00:00 AM)');
  });

  it('returns the passed date in correct format', () => {
    const value = new Date('2024-01-03T06:38:07.603510Z');
    const result = displayTimestamp({ value });
    expect(result).toEqual('03/01/2024 (01:38:07 PM)');
  });
});
