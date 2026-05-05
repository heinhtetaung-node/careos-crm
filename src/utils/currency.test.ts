import {
  numberToMoney,
  formatSatangToBaht,
  formatBahtToSatang,
  satangToBahtNumber,
} from './currency';

test('should format to money Format', () => {
  const result = numberToMoney(100000);
  expect(result).toBe('100,000');
});

test('should format with currency value', () => {
  const result = numberToMoney(100000, 'th-TH', 'THB');
  expect(result).toBe('฿100,000.00');
});

describe('formatSatangToBaht', () => {
  const satangToBahtScenarios = [
    {
      satang: '10000000000000',
      thb: '100,000,000,000',
    },
    {
      satang: '12345',
      thb: '123.45',
    },
    {
      satang: '12',
      thb: '0.12',
    },
    {
      satang: '1234500',
      thb: '12,345',
    },
    {
      satang: '100001',
      thb: '1,000.01',
    },
    {
      satang: '-92500',
      thb: '-925',
    },
    {
      satang: '-6659',
      thb: '-66.59',
    },
    {
      satang: '+6659',
      thb: '+66.59',
    },
    {
      satang: '+1000',
      thb: '+10',
    },
  ];

  satangToBahtScenarios.forEach((scenario) => {
    it(`should return ${scenario.thb} when passed ${scenario.satang} to formatSatangToBaht function`, () => {
      expect(formatSatangToBaht(scenario.satang)).toBe(scenario.thb);
    });
  });
});

describe('formatBahtToSatang', () => {
  const bahtToSatangScenarios = [
    {
      thb: '100,000,000,000',
      satang: '10000000000000',
    },
    {
      thb: '123.45',
      satang: '12345',
    },
    {
      thb: '0.12',
      satang: '12',
    },
    {
      thb: '12,345',
      satang: '1234500',
    },
    {
      thb: 12345,
      satang: '1234500',
    },
    {
      thb: 123,
      satang: '12300',
    },
    {
      thb: undefined,
      satang: undefined,
    },
  ];

  bahtToSatangScenarios.forEach((scenario) => {
    it(`should return ${scenario.satang} when passed ${scenario.thb} to formatBahtToSatang function`, () => {
      expect(formatBahtToSatang(scenario.thb)).toBe(scenario.satang);
    });
  });
});

describe('satangToBahtNumber', () => {
  it('should transform satang to baht in number format', () => {
    expect(satangToBahtNumber('1000011')).toBe(10000.11);
  });
  it('should transform satang to baht in number format and ceil', () => {
    expect(satangToBahtNumber('1000011', 'ceil')).toBe(10001);
  });
  it('should transform satang to baht in number format and floor', () => {
    expect(satangToBahtNumber('1000011', 'floor')).toBe(10000);
  });
});
