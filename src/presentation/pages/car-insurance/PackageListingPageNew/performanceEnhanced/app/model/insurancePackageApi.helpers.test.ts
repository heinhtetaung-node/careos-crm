import {
  buildAggregationRequest,
  buildSearchRequest,
  resolveSubmodelFromCriteria,
} from './insurancePackageApi.helpers';
import type { AggregationCriteriaInput } from './insurancePackageApi.types';

const baseInput: AggregationCriteriaInput = {
  year: 2024,
  brandText: 'Toyota',
  modelText: 'Camry',
};

describe('resolveSubmodelFromCriteria', () => {
  it('returns lowercased trimmed subModelText when set', () => {
    expect(
      resolveSubmodelFromCriteria({ ...baseInput, subModelText: 'Sport V6' })
    ).toBe('sport v6');
  });

  it('falls back to carSubModelYear when subModelText is absent', () => {
    expect(
      resolveSubmodelFromCriteria({ ...baseInput, carSubModelYear: '2023' })
    ).toBe('2023');
  });

  it('prefers subModelText over carSubModelYear', () => {
    expect(
      resolveSubmodelFromCriteria({
        ...baseInput,
        subModelText: 'V6',
        carSubModelYear: '2023',
      })
    ).toBe('v6');
  });

  it('returns undefined when neither is provided', () => {
    expect(resolveSubmodelFromCriteria(baseInput)).toBeUndefined();
  });
});

describe('buildAggregationRequest', () => {
  it('builds a basic request with required fields', () => {
    const result = buildAggregationRequest(baseInput);

    expect(result.productType).toBe('motor');
    expect(result.criteria.redbookid).toBe('');
    expect(result.criteria).not.toHaveProperty('year');
    expect(result.criteria).not.toHaveProperty('brand');
    expect(result.criteria).not.toHaveProperty('model');
  });

  it('sends redbookid when set and does not send year, brand, or model in criteria', () => {
    const result = buildAggregationRequest({
      ...baseInput,
      brandText: 'HONDA',
      modelText: 'CIVIC',
      redbookId: 'rb-1',
    });
    expect(result.criteria.redbookid).toBe('rb-1');
    expect(result.criteria).not.toHaveProperty('year');
    expect(result.criteria).not.toHaveProperty('brand');
    expect(result.criteria).not.toHaveProperty('model');
  });

  it('does not send submodel in aggregation criteria (including when subModelText / carSubModelYear are set)', () => {
    const result = buildAggregationRequest({
      ...baseInput,
      subModelText: 'Sport V6',
      carSubModelYear: '2023',
    });
    expect(result.criteria).not.toHaveProperty('submodel');
  });

  it('sends redbookid and omits year, brand, model on aggregation when redbookId is set', () => {
    const result = buildAggregationRequest({
      ...baseInput,
      subModelText: 'Sport',
      redbookId: 'rb-abc',
    });
    expect(result.criteria.redbookid).toBe('rb-abc');
    expect(result.criteria.year).toBeUndefined();
    expect(result.criteria.brand).toBeUndefined();
    expect(result.criteria.model).toBeUndefined();
  });

  it('includes both dashcam values when dashCam is true', () => {
    const result = buildAggregationRequest({ ...baseInput, dashCam: true });
    expect(result.criteria.dashcam).toEqual(['required', 'not required']);
  });

  it('includes only not-required dashcam when dashCam is false', () => {
    const result = buildAggregationRequest({ ...baseInput, dashCam: false });
    expect(result.criteria.dashcam).toEqual(['not required']);
  });

  it('includes only not-required dashcam when dashCam is undefined', () => {
    const result = buildAggregationRequest(baseInput);
    expect(result.criteria.dashcam).toEqual(['not required']);
  });

  it('strips "insurers/" prefix from insurer ids', () => {
    const result = buildAggregationRequest({
      ...baseInput,
      selectedInsurers: ['insurers/vib', 'axa'],
    });
    expect(result.criteria.insurer).toEqual(['vib', 'axa']);
  });

  it('omits insurer when selectedInsurers is empty', () => {
    const result = buildAggregationRequest({
      ...baseInput,
      selectedInsurers: [],
    });
    expect(result.criteria.insurer).toBeUndefined();
  });

  it('includes drivingPurpose as vehicleregistrationpurpose when provided', () => {
    const result = buildAggregationRequest({
      ...baseInput,
      drivingPurpose: 'commercial',
    });
    expect(result.criteria.vehicleregistrationpurpose).toEqual(['commercial']);
  });

  it('omits vehicleregistrationpurpose when drivingPurpose is not provided', () => {
    const result = buildAggregationRequest(baseInput);
    expect(result.criteria.vehicleregistrationpurpose).toBeUndefined();
  });

  it('requests all expected metrics including package_count', () => {
    const result = buildAggregationRequest(baseInput);
    expect(result.metrics).toContain('price_min');
    expect(result.metrics).toContain('price_max');
    expect(result.metrics).toContain('coverage_min');
    expect(result.metrics).toContain('coverage_max');
    expect(result.metrics).toContain('sub_models');
    expect(result.metrics).toContain('package_count');
  });

  it('maps insurancetype by lowercasing and replacing underscore', () => {
    const result = buildAggregationRequest({
      ...baseInput,
      insurancetype: ['type_1', 'type_2'],
    });

    expect(result.criteria.insurancetype).toEqual(['type 1', 'type 2']);
  });

  it('appends " compulsory" to types when compulsory is selected and excludes standalone compulsory', () => {
    const result = buildAggregationRequest({
      ...baseInput,
      insurancetype: ['type_1', 'type_3', 'compulsory'],
    });

    expect(result.criteria.insurancetype).toEqual([
      'type 1 compulsory',
      'type 3 compulsory',
    ]);
  });

  it('keeps compulsory insurancetype when only compulsory is selected', () => {
    const result = buildAggregationRequest({
      ...baseInput,
      insurancetype: ['compulsory'],
    });

    expect(result.criteria.insurancetype).toEqual(['compulsory']);
  });

  it('does not put year, brand, or model on criteria when year is omitted', () => {
    const result = buildAggregationRequest({
      brandText: 'Honda',
      modelText: 'Civic',
    });
    expect(result.criteria.redbookid).toBe('');
    expect(result.criteria).not.toHaveProperty('year');
    expect(result.criteria).not.toHaveProperty('brand');
    expect(result.criteria).not.toHaveProperty('model');
  });
});

describe('buildSearchRequest', () => {
  const searchOptions = {
    insurerId: 'insurers/vib',
    sortBy: 'price' as const,
    direction: 'asc' as const,
    limit: 10,
  };

  it('builds a valid search request with required fields', () => {
    const result = buildSearchRequest(baseInput, searchOptions);

    expect(result.productType).toBe('motor');
    expect(result.criteria.redbookid).toBe('');
    expect(result.criteria).not.toHaveProperty('year');
    expect(result.criteria).not.toHaveProperty('brand');
    expect(result.criteria).not.toHaveProperty('model');
    expect(result.criteria.insurer).toEqual(['insurers/vib']);
    expect(result.cursor.sort_by).toBe('price');
    expect(result.cursor.direction).toBe('asc');
  });

  it('sets cursor.sort_by to maximumannualcoverage when sorting by car coverage', () => {
    const result = buildSearchRequest(baseInput, {
      ...searchOptions,
      sortBy: 'maximumannualcoverage',
      direction: 'desc',
    });

    expect(result.cursor.sort_by).toBe('maximumannualcoverage');
    expect(result.cursor.direction).toBe('desc');
  });

  it('includes redbookid and omits year, brand, model in search when redbookId is provided', () => {
    const result = buildSearchRequest(
      { ...baseInput, redbookId: 'rb-xyz' },
      searchOptions
    );
    expect(result.criteria.redbookid).toBe('rb-xyz');
    expect(result.criteria.year).toBeUndefined();
    expect(result.criteria.brand).toBeUndefined();
    expect(result.criteria.model).toBeUndefined();
  });

  it('sends empty redbookid when redbookId is not provided', () => {
    const result = buildSearchRequest(
      { ...baseInput, subModelText: 'GT Sport' },
      searchOptions
    );
    expect(result.criteria.redbookid).toBe('');
  });

  it('includes cursor token when nextToken is provided', () => {
    const result = buildSearchRequest(baseInput, {
      ...searchOptions,
      nextToken: 'abc123',
    });
    expect(result.cursor.token).toBe('abc123');
  });

  it('omits cursor token when nextToken is not provided', () => {
    const result = buildSearchRequest(baseInput, searchOptions);
    expect(result.cursor.token).toBeUndefined();
  });

  it('includes all expected attributes', () => {
    const result = buildSearchRequest(baseInput, searchOptions);
    expect(result.attributes).toContain('insurancetype');
    expect(result.attributes).toContain('deductible');
    expect(result.attributes).toContain('submodel');
    expect(result.attributes).toContain('repairtype');
  });

  it('maps insurancetype for search request', () => {
    const result = buildSearchRequest(
      { ...baseInput, insurancetype: ['type_1', 'type_2'] },
      searchOptions
    );

    expect(result.criteria.insurancetype).toEqual(['type 1', 'type 2']);
  });

  it('appends " compulsory" to search types when compulsory is selected and excludes standalone compulsory', () => {
    const result = buildSearchRequest(
      { ...baseInput, insurancetype: ['type_1', 'compulsory'] },
      searchOptions
    );

    expect(result.criteria.insurancetype).toEqual(['type 1 compulsory']);
  });

  it('keeps compulsory insurancetype in search criteria when only compulsory is selected', () => {
    const result = buildSearchRequest(
      { ...baseInput, insurancetype: ['compulsory'] },
      searchOptions
    );

    expect(result.criteria.insurancetype).toEqual(['compulsory']);
  });

  it('includes dashcam both values when dashCam is true', () => {
    const result = buildSearchRequest(
      { ...baseInput, dashCam: true },
      searchOptions
    );
    expect(result.criteria.dashcam).toEqual(['required', 'not required']);
  });

  it('includes only not-required dashcam when dashCam is false', () => {
    const result = buildSearchRequest(
      { ...baseInput, dashCam: false },
      searchOptions
    );
    expect(result.criteria.dashcam).toEqual(['not required']);
  });

  it('includes drivingPurpose in vehicleregistrationpurpose when provided', () => {
    const result = buildSearchRequest(
      { ...baseInput, drivingPurpose: 'personal' },
      searchOptions
    );
    expect(result.criteria.vehicleregistrationpurpose).toEqual(['personal']);
  });
});
