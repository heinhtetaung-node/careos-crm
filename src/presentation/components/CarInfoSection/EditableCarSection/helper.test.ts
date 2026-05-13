import {
  getMappedCarData,
  parseManufacturedYear,
  parseCarSubmodelResourceNameToOptionValue,
} from './helper';

describe('parseCarSubmodelResourceNameToOptionValue', () => {
  it('uses substring after years/ when name includes years/', () => {
    expect(
      parseCarSubmodelResourceNameToOptionValue(
        'brands/6/models/430/submodels/x/years/36003'
      )
    ).toBe(36003);
    expect(parseCarSubmodelResourceNameToOptionValue('years/42')).toBe(42);
  });

  it('uses the last path segment when years/ is absent', () => {
    expect(
      parseCarSubmodelResourceNameToOptionValue(
        'manufacturedYears/2004/brands/6/models/430'
      )
    ).toBe(430);
    expect(parseCarSubmodelResourceNameToOptionValue('a/b/999')).toBe(999);
  });

  it('returns empty string when no numeric segment can be parsed as value', () => {
    expect(parseCarSubmodelResourceNameToOptionValue(undefined)).toBe('');
    expect(parseCarSubmodelResourceNameToOptionValue('')).toBe('');
  });
});

describe('parseManufacturedYear function', () => {
  it('parses plain number (old API format)', () => {
    expect(parseManufacturedYear(2025)).toBe(2025);
    expect(parseManufacturedYear(2020)).toBe(2020);
    expect(parseManufacturedYear(1990)).toBe(1990);
  });

  it('parses object with year property (new API format)', () => {
    expect(
      parseManufacturedYear({ name: 'manufacturedYears/2025', year: 2025 })
    ).toBe(2025);
    expect(parseManufacturedYear({ year: 2020 })).toBe(2020);
    expect(
      parseManufacturedYear({ name: 'manufacturedYears/2018', year: 2018 })
    ).toBe(2018);
  });

  it('parses object with name property containing path segments (new API fallback)', () => {
    expect(parseManufacturedYear({ name: 'manufacturedYears/2025' })).toBe(
      2025
    );
    expect(parseManufacturedYear({ name: 'manufacturedYears/2020' })).toBe(
      2020
    );
    expect(parseManufacturedYear({ name: 'years/2015' })).toBe(2015);
  });

  it('returns undefined for invalid inputs', () => {
    expect(parseManufacturedYear(null)).toBeUndefined();
    expect(parseManufacturedYear(undefined)).toBeUndefined();
    expect(parseManufacturedYear({})).toBeUndefined();
    expect(parseManufacturedYear({ name: '' })).toBeUndefined();
    expect(Number.isNaN(parseManufacturedYear({ name: 'invalid' }))).toBe(true);
    expect(parseManufacturedYear('2025')).toBeUndefined();
  });

  it('handles edge cases', () => {
    expect(
      parseManufacturedYear({ name: 'manufacturedYears/' })
    ).toBeUndefined();
    expect(parseManufacturedYear({ name: '2025' })).toBe(2025);
    expect(parseManufacturedYear({ year: 0 })).toBe(0);
  });
});

describe('getMappedCarData function', () => {
  const carData = {
    redPlate: true,
    modification: false,
    brand: 2,
    carUsageType: 'commercial',
    isVan: false,
  };

  const patchData = [
    {
      name: 'carModified',
      field: 'value',
      response: true,
    },
    {
      name: 'carDashCam',
      field: 'isDisabled',
      response: true,
    },
    {
      name: 'brand',
      field: 'options',
      response: [
        { id: 0, value: 1, title: 'Honda' },
        { id: 0, value: 2, title: 'Toyota' },
      ],
    },
  ];

  it('returns correct response', () => {
    expect(getMappedCarData(carData, patchData)).toMatchObject({
      brand: {
        inputProps: {
          options: [
            { id: 0, value: 1, title: 'Honda' },
            { id: 0, value: 2, title: 'Toyota' },
          ],
        },
      },
      carModified: {
        inputProps: {
          value: true,
        },
      },
      carDashCam: {
        inputProps: {
          isDisabled: true,
        },
      },
      carLicensePlate: {
        inputProps: {
          isDisabled: true,
        },
      },
      carRegisteredSeats: {
        inputProps: {
          options: [],
          isDisabled: true,
        },
      },
    });
  });
});
