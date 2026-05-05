import { removeZeroPadding } from '../number';

describe('removeZeroPaddiing', () => {
  it('should remove zero padding', () => {
    const result = removeZeroPadding('003.3');
    expect(result).toBe('3.3');
  });
});
