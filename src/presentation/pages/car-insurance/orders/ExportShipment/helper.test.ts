import { computeOrderBy } from './helper';

describe('computeOrderBy', () => {
  it('should return undefined if there is no sorting', () => {
    const result = computeOrderBy([
      {
        field: '1',
        id: '1',
        label: 'label',
        sorting: 'desc',
        disabled: true,
      },
      {
        field: '2',
        id: '2',
        label: 'label',
        sorting: 'none',
        disabled: false,
      },
    ]);
    expect(result).toBe(undefined);
  });

  it('should return string if there is sorting', () => {
    const result = computeOrderBy([
      {
        field: '1',
        id: '1',
        label: 'label',
        sorting: 'desc',
        disabled: true,
      },
      {
        field: '2',
        id: '2',
        label: 'label',
        sorting: 'asc',
        disabled: false,
      },
    ]);
    expect(result).toBe('2');
  });

  it('should return string if there is sorting', () => {
    const result = computeOrderBy([
      {
        field: '1',
        id: '1',
        label: 'label',
        sorting: 'desc',
        disabled: false,
      },
      {
        field: '2',
        id: '2',
        label: 'label',
        sorting: 'none',
        disabled: true,
      },
    ]);
    expect(result).toBe('1 desc');
  });
});
