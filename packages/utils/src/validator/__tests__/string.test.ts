import { rabbitString, validateMotorPolicyHolderName } from '../string';

describe('validateMotorPolicyHolderName', () => {
  it('should invalidate if empty', () => {
    const result = validateMotorPolicyHolderName('');
    expect(result).toEqual(
      expect.objectContaining({
        isValid: false,
        errorCode: 'required',
      })
    );
  });
  it('should invalidate if exceed max charater', () => {
    const result = validateMotorPolicyHolderName('a'.repeat(50));
    expect(result).toEqual(
      expect.objectContaining({
        isValid: false,
        errorCode: 'max',
        params: expect.objectContaining({ max: 40 }),
      })
    );
  });
  it('should invalidate if include special charater', () => {
    const result = validateMotorPolicyHolderName('a*-#1');
    expect(result).toEqual(
      expect.objectContaining({
        isValid: false,
        errorCode: 'invalid',
      })
    );
  });
  it('should validate if input valid string', () => {
    const result = validateMotorPolicyHolderName('aA .');
    expect(result).toEqual(
      expect.objectContaining({
        isValid: true,
        errorCode: '',
      })
    );
  });
});

describe('rabbitString', () => {
  it('should invalidate name if it contain invaid', () => {
    expect(() => rabbitString().customerName().validateSync('!@#')).toThrow();
  });
  it('should invalidate name if it contain more than 50 charater', () => {
    expect(() =>
      rabbitString().customerName().validateSync('abc'.repeat(20))
    ).toThrow();
  });
  it('should invalidate name if it is empty', () => {
    expect(() => rabbitString().customerName().validateSync('')).toThrow();
  });

  it('should validate with check method', () => {
    const res = rabbitString()
      .customerName({ required: 'require message' })
      .check('');
    expect(res).toEqual({
      isValid: false,
      errorCode: 'required',
      message: 'require message',
    });
  });
});
