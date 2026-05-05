import { combinePackageDetailArray } from './translatePackage.helper';

const mockData1 = {
  123: {
    items: [
      {
        label: 'voluntary_price',
        text: 'included_price_123',
      },
      {
        label: 'mandatory_price',
        text: 'included_price_123',
      },
    ],
  },
  124: {
    items: [
      {
        label: 'voluntary_price',
        text: 'included_price_124',
      },
      {
        label: 'mandatory_price',
        text: 'included_price_124',
      },
    ],
  },
};

const mockData2 = {
  123: {
    items: [
      {
        label: 'voluntary_price',
        text: 'included_price_123',
      },
    ],
  },
  124: {
    items: [
      {
        label: 'mandatory_price',
        text: 'included_price_124',
      },
    ],
  },
};

describe('hashDetailArray', () => {
  test('should return hash and transform', () => {
    const { keys, result } = combinePackageDetailArray(
      mockData1 as any,
      'label',
      'items'
    );
    expect(result).toEqual({
      voluntary_price: {
        123: { text: 'included_price_123' },
        124: { text: 'included_price_124' },
      },
      mandatory_price: {
        123: { text: 'included_price_123' },
        124: { text: 'included_price_124' },
      },
    });
    expect(keys).toEqual(['voluntary_price', 'mandatory_price']);
  });

  test('should return with - values if value doesnt exist', () => {
    const { keys, result } = combinePackageDetailArray(
      mockData2 as any,
      'label',
      'items'
    );
    expect(result).toEqual({
      voluntary_price: {
        123: { text: 'included_price_123' },
        124: {},
      },
      mandatory_price: {
        123: {},
        124: { text: 'included_price_124' },
      },
    });
    expect(keys).toEqual(['voluntary_price', 'mandatory_price']);
  });
});
