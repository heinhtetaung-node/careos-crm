import {
  getPackagesUrl,
  getPackageDetailUrl,
  getPackageComparisonlUrl,
} from './Urls';

describe('urls', () => {
  test('should return url with variable placeholder if call with no params', () => {
    const result = getPackagesUrl();
    expect(result).toBe('/leads/:id/packages');
  });

  test('should return url with actual value if call with prams', () => {
    const result = getPackagesUrl('leadId');
    expect(result).toBe('/leads/leadId/packages');
  });

  test('should return url with variable placeholder if call with no params', () => {
    const result = getPackageDetailUrl();
    expect(result).toBe('/leads/:id/detail');
  });

  test('should return url with actual value if call with param', () => {
    const result = getPackageDetailUrl({
      leadId: 'leadId',
      packageId: 'packageId',
    });
    expect(result).toBe('/leads/leadId/detail?id=packageId');
  });

  test('should return compare page url with variable placeholder if call with no params', () => {
    const result = getPackageComparisonlUrl();
    expect(result).toBe('/leads/:id/compare');
  });

  test('should return compare page url with actual value if call with param', () => {
    const result = getPackageComparisonlUrl({
      leadId: 'leadId',
      packageId: 'packageId1,packageId2',
    });
    expect(result).toBe('/leads/leadId/compare?id=packageId1%2CpackageId2');
  });

  test('should include only id param when noParams is true', () => {
    const result = getPackageDetailUrl({
      leadId: 'leadId',
      packageId: 'packageId',
      otherParams: { filter: 'someFilter', customQuote: 'true' },
      noParams: true,
    });
    expect(result).toBe('/leads/leadId/detail?id=packageId');
  });

  test('should include all params when noParams is false', () => {
    const result = getPackageDetailUrl({
      leadId: 'leadId',
      packageId: 'packageId',
      otherParams: { filter: 'someFilter', customQuote: 'true' },
      noParams: false,
    });
    expect(result).toBe(
      '/leads/leadId/detail?filter=someFilter&customQuote=true&id=packageId'
    );
  });

  test('should return custom detail url when packageId starts with packages', () => {
    const result = getPackageDetailUrl({
      leadId: 'leadId',
      packageId: 'packages123',
    });

    expect(result).toBe('/leads/leadId/detail/custom?id=packages123');
  });
});
