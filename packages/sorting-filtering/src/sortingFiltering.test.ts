import customPackages from '@alphafounders/mock-data/json/customPackages.json';
import packages from '@alphafounders/mock-data/json/packages.json';
import sortedFilteredPackage from '@alphafounders/mock-data/json/sortedFilteredPackages.json';

import { FilterInterface } from './interface';
import { sortByPackageType, sortByDate } from './motor';

import sortAndFilter from '.';

const filters: FilterInterface = {
  deductible: 'all_packages',
  insuranceCategory: 'both',
  insuranceType: {
    'Type 1': true,
    'Type 2': false,
    'Type 2+': true,
    'Type 3': true,
    'Type 3+': true,
  },
  insurer: {
    'insurer/5': true,
    'insurer/7': true,
    'insurer/11': true,
    'insurer/17': true,
    'insurer/19': true,
    'insurer/24': true,
    'insurer/25': true,
    'insurer/27': true,
    'insurer/33': true,
    'insurer/35': true,
  },
  repairType: 'both',
};

describe('sortAndFilter', () => {
  it('returns filtered package with type motor is passed', () => {
    const filteredPackages = sortAndFilter(
      'motor',
      packages as any,
      filters,
      true
    );
    expect(filteredPackages.normalPackages).toEqual(sortedFilteredPackage);
  });

  it('returns no package with type motor is passed and omission logic is enabled', () => {
    const filteredPackages = sortAndFilter(
      'motor',
      packages as any,
      filters,
      false,
      true
    );
    expect(filteredPackages.normalPackages).toEqual([]);
  });

  it('returns the packages passed with type is not passed', () => {
    const filteredPackages = sortAndFilter('', packages as any, filters, true);
    expect(filteredPackages.normalPackages).toEqual(packages);
  });

  it('should not returns the normalPackages same like customPackages passed with type is passed', () => {
    const filteredPackages = sortAndFilter(
      'motor',
      customPackages as any,
      filters,
      true
    );
    expect(filteredPackages.normalPackages).not.toEqual(customPackages);
  });

  it('should not returns the customPackages passed with type is passed', () => {
    const filteredPackages = sortAndFilter(
      'motor',
      customPackages as any,
      filters,
      true
    );
    expect(filteredPackages.customPackages).not.toEqual(customPackages);
  });

  // Fix this test.
  it.skip('should return correct package if sumInsured and price filter are present', () => {
    const filteredPackages = sortAndFilter(
      'motor',
      packages as any,
      {
        ...filters,
        price: { min: BigInt(0), max: BigInt(100000) },
        sumInsured: { min: BigInt(0), max: BigInt(100000) },
      },
      true,
      false,
      'en'
    );
    expect(filteredPackages.normalPackages).toEqual(sortedFilteredPackage);
  });
});

describe('Render motor filter', () => {
  it('Should not return blank array if we passed []', () => {
    expect(sortByPackageType([])).toEqual([]);
  });

  it('Should not return customPackageMockData if we passed customPackageMockData', () => {
    expect(sortByPackageType(customPackages)).not.toEqual(customPackages);
  });

  it('Should not return sortByDate if status passed mock package with key', () => {
    expect(sortByDate(customPackages as any, 'createTime')).toEqual(
      customPackages
    );
  });
});
