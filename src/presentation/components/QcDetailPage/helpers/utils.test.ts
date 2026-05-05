import { formatSatang } from './utils';

describe('Helper functions from utils.ts', () => {
  it('formatSatang should return a comma-formatted number with 2 decimal places', () => {
    expect(formatSatang(100000)).toEqual('1,000.00');
  });

  it('formatSatang should return 0.00 for a value of 0', () => {
    expect(formatSatang(0)).toEqual('0.00');
  });
});
