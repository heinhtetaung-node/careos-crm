import { extractCoverageDetails, CoverageDetails } from './index';
import { mockCoverageData } from 'mock-data/ExtractCoverageDetails.mock';

describe('extractCoverageDetails', () => {
  const defaultCoverageDetails: CoverageDetails = {
    maximumAnnualCoverage: 0,
    personalInjury: 0,
    medicalExpense: 0,
    bailBond: 0,
    propertyDamage: 0,
    deathPerPerson: 0,
    maximumDeath: 0,
    floodCoverage: 0,
    theftAndFireCoverage: 0,
  };
  it('should return default values for empty array', () => {
    expect(extractCoverageDetails(mockCoverageData.empty)).toEqual(
      defaultCoverageDetails
    );
  });
  it('should handle coverages without singleValue', () => {
    expect(extractCoverageDetails(mockCoverageData.withoutSingleValue)).toEqual(
      defaultCoverageDetails
    );
  });
  it('should extract all coverage types correctly', () => {
    const result = extractCoverageDetails(mockCoverageData.allCoverageTypes);
    expect(result).toEqual({
      maximumAnnualCoverage: 500000,
      personalInjury: 100000,
      medicalExpense: 50000,
      bailBond: 25000,
      propertyDamage: 200000,
      deathPerPerson: 300000,
      maximumDeath: 1000000,
      floodCoverage: 150000,
      theftAndFireCoverage: 200000,
    });
  });
  it('should handle unknown coverage types gracefully', () => {
    expect(
      extractCoverageDetails(mockCoverageData.unknownCoverageType)
    ).toEqual(defaultCoverageDetails);
  });
  it('should handle duplicate coverage types (uses last)', () => {
    expect(
      extractCoverageDetails(mockCoverageData.duplicateCoverageTypes)
        .personalInjury
    ).toBe(200000);
  });
  it('should handle decimal values', () => {
    expect(
      extractCoverageDetails(mockCoverageData.decimalValues).personalInjury
    ).toBe(100000.5);
  });
  it('should handle invalid numeric values (converts to 0)', () => {
    expect(
      extractCoverageDetails(mockCoverageData.invalidNumericValues)
        .personalInjury
    ).toBe(0);
  });
  it('should handle null/undefined singleValue', () => {
    expect(
      extractCoverageDetails(mockCoverageData.nullUndefinedSingleValue)
    ).toEqual(defaultCoverageDetails);
  });
  it('should handle empty string values', () => {
    expect(
      extractCoverageDetails(mockCoverageData.emptyStringValues).personalInjury
    ).toBe(0);
  });
  it('should handle zero values', () => {
    expect(
      extractCoverageDetails(mockCoverageData.zeroValues).personalInjury
    ).toBe(0);
  });
  it('should handle negative values', () => {
    expect(
      extractCoverageDetails(mockCoverageData.negativeValues).personalInjury
    ).toBe(-1000);
  });
  it('should handle scientific notation', () => {
    expect(
      extractCoverageDetails(mockCoverageData.scientificNotation).personalInjury
    ).toBe(1000000);
  });
  it('should handle Infinity values', () => {
    const result = extractCoverageDetails(mockCoverageData.infinityValues);
    expect(result.personalInjury).toBe(Infinity);
    expect(result.maximumAnnualCoverage).toBe(-Infinity);
  });
  it('should handle mixed valid and invalid data', () => {
    const result = extractCoverageDetails(mockCoverageData.mixedValidInvalid);
    expect(result.personalInjury).toBe(100000);
    expect(result.maximumAnnualCoverage).toBe(0);
    expect(result.medicalExpense).toBe(50000);
  });
});
