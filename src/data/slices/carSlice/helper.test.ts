import { getCarDataQueryPath } from './helper';

describe('getCarSearchQueryPath', () => {
  it('should return correct query path', () => {
    const result = getCarDataQueryPath({
      resourceType: 'years',
      models: '123',
    });
    expect(result).toBe('brands/-/models/123/submodels/-/years');
  });
});
