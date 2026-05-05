import { thaiDateFormat, thaiDateFormatV2 } from './thaiDateFormat';

describe('thaiDateFormat', () => {
  it('should return the date in dd/MM/yyyy fornat and include thai year ', () => {
    const date = '2023-03-31T00:00:00Z';
    expect(thaiDateFormat(date)).toBe('31/03/2023 (2566)');
  });

  it('should return the date in dd/MM/yyyy fornat and include thai year', () => {
    const date = '2023-03-31T22:00:00Z';
    expect(thaiDateFormat(date)).toBe('01/04/2023 (2566)');
  });
});

describe('thaiDateFormatV2', () => {
  it('should return the date in dd/MM/yyyy fornat and include thai year ', () => {
    const date = '2023-03-31T00:00:00Z';
    expect(thaiDateFormatV2(date)).toBe('31/03/2023(2566)');
  });

  it('should return the date in dd/MM/yyyy format and include thai year', () => {
    const date = '2023-03-31T22:00:00Z';
    expect(thaiDateFormatV2(date)).toBe('01/04/2023(2566)');
  });
});
