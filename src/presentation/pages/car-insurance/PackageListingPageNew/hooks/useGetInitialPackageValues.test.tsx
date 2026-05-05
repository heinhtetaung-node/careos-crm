import {
  getUniqueValues,
  resolveSubModelsForPackageListing,
} from './useGetInitialPackageValues';

const subModelOptions = [
  { value: 2020, label: 'A', redbookId: '' },
  { value: 2021, label: 'B', redbookId: 'rb-1' },
  { value: 9999, label: 'C' },
];

describe('resolveSubModelsForPackageListing', () => {
  it('returns options unchanged when onlyRedbookId is undefined', () => {
    expect(
      resolveSubModelsForPackageListing(undefined, subModelOptions, 2020)
    ).toEqual(subModelOptions);
  });

  it('returns options unchanged when onlyRedbookId is false', () => {
    expect(
      resolveSubModelsForPackageListing(false, subModelOptions, 2020)
    ).toEqual(subModelOptions);
  });

  it('when onlyRedbookId is true, keeps options with a truthy redbookId', () => {
    const options = [
      { value: 1, label: 'no rb', redbookId: '' },
      { value: 2, label: 'has rb', redbookId: 'rb-1' },
      { value: 3, label: 'neither' },
    ];
    const result = resolveSubModelsForPackageListing(true, options, 999);
    expect(result).toEqual([{ value: 2, label: 'has rb', redbookId: 'rb-1' }]);
  });

  it('when onlyRedbookId is true, keeps option whose value matches lead carSubModelYear', () => {
    const options = [
      { value: 36003, label: 'Current' },
      { value: 99999, label: 'Other' },
    ];
    expect(resolveSubModelsForPackageListing(true, options, 36003)).toEqual([
      { value: 36003, label: 'Current' },
    ]);
  });

  it('when onlyRedbookId is true, keeps option that matches by value OR has redbookId', () => {
    const options = [
      { value: 2020, redbookId: '' },
      { value: 2021, redbookId: 'x' },
    ];
    const result = resolveSubModelsForPackageListing(true, options, 2020);
    expect(result).toEqual(options);
  });

  it('when onlyRedbookId is true, drops options with no redbookId and non-matching value', () => {
    expect(
      resolveSubModelsForPackageListing(true, [{ value: 1, label: 'x' }], 999)
    ).toEqual([]);
  });

  it('when onlyRedbookId is true and options is undefined, returns undefined', () => {
    expect(
      resolveSubModelsForPackageListing(true, undefined, 2020)
    ).toBeUndefined();
  });
});

describe('getUniqueValues', () => {
  describe('with empty data', () => {
    it('should return empty array when data is empty', () => {
      const result = getUniqueValues([], 'engineSize');
      expect(result).toEqual([]);
    });

    it('should return empty array when data is null', () => {
      const result = getUniqueValues(null as any, 'engineSize');
      expect(result).toEqual([]);
    });

    it('should return empty array when data is undefined', () => {
      const result = getUniqueValues(undefined as any, 'engineSize');
      expect(result).toEqual([]);
    });
  });

  describe('with engineSize key', () => {
    it('should return unique engine sizes', () => {
      const data = [
        { engineSize: 1.5, doors: 4 },
        { engineSize: 2.0, doors: 4 },
        { engineSize: 1.5, doors: 2 },
        { engineSize: 3.0, doors: 4 },
      ];

      const result = getUniqueValues(data, 'engineSize');

      expect(result).toEqual([
        { key: 1.5, label: 1.5, value: 1.5 },
        { key: 2.0, label: 2.0, value: 2.0 },
        { key: 3.0, label: 3.0, value: 3.0 },
      ]);
    });

    it('should handle single item', () => {
      const data = [{ engineSize: 1.8, doors: 4 }];
      const result = getUniqueValues(data, 'engineSize');

      expect(result).toEqual([{ key: 1.8, label: 1.8, value: 1.8 }]);
    });

    it('should handle all same engine sizes', () => {
      const data = [
        { engineSize: 2.0, doors: 4 },
        { engineSize: 2.0, doors: 2 },
        { engineSize: 2.0, doors: 5 },
      ];

      const result = getUniqueValues(data, 'engineSize');

      expect(result).toEqual([{ key: 2.0, label: 2.0, value: 2.0 }]);
    });
  });

  describe('with doors key', () => {
    it('should return unique door counts', () => {
      const data = [
        { engineSize: 1.5, doors: 2 },
        { engineSize: 2.0, doors: 4 },
        { engineSize: 1.8, doors: 2 },
        { engineSize: 3.0, doors: 5 },
        { engineSize: 1.6, doors: 4 },
      ];

      const result = getUniqueValues(data, 'doors');

      expect(result).toEqual([
        { key: 2, label: 2, value: 2 },
        { key: 4, label: 4, value: 4 },
        { key: 5, label: 5, value: 5 },
      ]);
    });

    it('should handle single item', () => {
      const data = [{ engineSize: 1.8, doors: 3 }];
      const result = getUniqueValues(data, 'doors');

      expect(result).toEqual([{ key: 3, label: 3, value: 3 }]);
    });

    it('should handle all same door counts', () => {
      const data = [
        { engineSize: 1.5, doors: 4 },
        { engineSize: 2.0, doors: 4 },
        { engineSize: 3.0, doors: 4 },
      ];

      const result = getUniqueValues(data, 'doors');

      expect(result).toEqual([{ key: 4, label: 4, value: 4 }]);
    });
  });

  describe('with mixed data types', () => {
    it('should handle zero values', () => {
      const data = [
        { engineSize: 0, doors: 0 },
        { engineSize: 1.5, doors: 4 },
        { engineSize: 0, doors: 2 },
      ];

      const engineResult = getUniqueValues(data, 'engineSize');
      const doorsResult = getUniqueValues(data, 'doors');

      expect(engineResult).toEqual([
        { key: 0, label: 0, value: 0 },
        { key: 1.5, label: 1.5, value: 1.5 },
      ]);

      expect(doorsResult).toEqual([
        { key: 0, label: 0, value: 0 },
        { key: 4, label: 4, value: 4 },
        { key: 2, label: 2, value: 2 },
      ]);
    });

    it('should handle negative values', () => {
      const data = [
        { engineSize: -1, doors: 4 },
        { engineSize: 1.5, doors: -2 },
        { engineSize: -1, doors: 4 },
      ];

      const engineResult = getUniqueValues(data, 'engineSize');
      const doorsResult = getUniqueValues(data, 'doors');

      expect(engineResult).toEqual([
        { key: -1, label: -1, value: -1 },
        { key: 1.5, label: 1.5, value: 1.5 },
      ]);

      expect(doorsResult).toEqual([
        { key: 4, label: 4, value: 4 },
        { key: -2, label: -2, value: -2 },
      ]);
    });

    it('should handle decimal values', () => {
      const data = [
        { engineSize: 1.2, doors: 4 },
        { engineSize: 1.25, doors: 2 },
        { engineSize: 1.2, doors: 4 },
        { engineSize: 1.333, doors: 5 },
      ];

      const engineResult = getUniqueValues(data, 'engineSize');
      const doorsResult = getUniqueValues(data, 'doors');

      expect(engineResult).toEqual([
        { key: 1.2, label: 1.2, value: 1.2 },
        { key: 1.25, label: 1.25, value: 1.25 },
        { key: 1.333, label: 1.333, value: 1.333 },
      ]);

      expect(doorsResult).toEqual([
        { key: 4, label: 4, value: 4 },
        { key: 2, label: 2, value: 2 },
        { key: 5, label: 5, value: 5 },
      ]);
    });
  });

  describe('duplicate handling', () => {
    it('should remove duplicate engine sizes', () => {
      const data = [
        { engineSize: 1.5, doors: 4 },
        { engineSize: 2.0, doors: 2 },
        { engineSize: 1.5, doors: 5 },
        { engineSize: 2.0, doors: 4 },
        { engineSize: 1.5, doors: 3 },
      ];

      const result = getUniqueValues(data, 'engineSize');

      expect(result).toEqual([
        { key: 1.5, label: 1.5, value: 1.5 },
        { key: 2.0, label: 2.0, value: 2.0 },
      ]);
    });

    it('should remove duplicate door counts', () => {
      const data = [
        { engineSize: 1.5, doors: 4 },
        { engineSize: 2.0, doors: 2 },
        { engineSize: 1.8, doors: 4 },
        { engineSize: 3.0, doors: 2 },
        { engineSize: 1.6, doors: 4 },
      ];

      const result = getUniqueValues(data, 'doors');

      expect(result).toEqual([
        { key: 4, label: 4, value: 4 },
        { key: 2, label: 2, value: 2 },
      ]);
    });
  });

  describe('large datasets', () => {
    it('should handle large arrays efficiently', () => {
      const data = Array.from({ length: 1000 }, (_, i) => ({
        engineSize: (i % 10) + 1, // 1-10 repeating
        doors: (i % 5) + 2, // 2-6 repeating
      }));

      const engineResult = getUniqueValues(data, 'engineSize');
      const doorsResult = getUniqueValues(data, 'doors');

      expect(engineResult).toHaveLength(10);
      expect(doorsResult).toHaveLength(5);

      // Check that all unique values are present
      const engineValues = engineResult
        .map((item) => item.value)
        .sort((a, b) => a - b);
      const doorsValues = doorsResult
        .map((item) => item.value)
        .sort((a, b) => a - b);

      expect(engineValues).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      expect(doorsValues).toEqual([2, 3, 4, 5, 6]);
    });
  });

  describe('edge cases', () => {
    it('should handle objects with missing properties', () => {
      const data = [
        { engineSize: 1.5, doors: 4 },
        { engineSize: 2.0 } as any, // missing doors
        { doors: 2 } as any, // missing engineSize
        { engineSize: 1.5, doors: 4 },
      ];

      const engineResult = getUniqueValues(data, 'engineSize');
      const doorsResult = getUniqueValues(data, 'doors');

      // Sort results to handle order differences
      const sortedEngineResult = engineResult.sort((a, b) => {
        if (a.value === undefined && b.value === undefined) return 0;
        if (a.value === undefined) return 1;
        if (b.value === undefined) return -1;
        return a.value - b.value;
      });

      const sortedDoorsResult = doorsResult.sort((a, b) => {
        if (a.value === undefined && b.value === undefined) return 0;
        if (a.value === undefined) return 1;
        if (b.value === undefined) return -1;
        return a.value - b.value;
      });

      expect(sortedEngineResult).toEqual([
        { key: 1.5, label: 1.5, value: 1.5 },
        { key: 2.0, label: 2.0, value: 2.0 },
        { key: undefined, label: undefined, value: undefined },
      ]);

      expect(sortedDoorsResult).toEqual([
        { key: 2, label: 2, value: 2 },
        { key: 4, label: 4, value: 4 },
        { key: undefined, label: undefined, value: undefined },
      ]);
    });

    it('should handle undefined values in properties', () => {
      const data = [
        { engineSize: 1.5, doors: 4 },
        { engineSize: undefined as any, doors: 2 },
        { engineSize: 1.5, doors: undefined as any },
      ];

      const engineResult = getUniqueValues(data, 'engineSize');
      const doorsResult = getUniqueValues(data, 'doors');

      expect(engineResult).toEqual([
        { key: 1.5, label: 1.5, value: 1.5 },
        { key: undefined, label: undefined, value: undefined },
      ]);

      expect(doorsResult).toEqual([
        { key: 4, label: 4, value: 4 },
        { key: 2, label: 2, value: 2 },
        { key: undefined, label: undefined, value: undefined },
      ]);
    });
  });

  describe('return value structure', () => {
    it('should return objects with correct structure', () => {
      const data = [{ engineSize: 1.5, doors: 4 }];
      const result = getUniqueValues(data, 'engineSize');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('key');
      expect(result[0]).toHaveProperty('label');
      expect(result[0]).toHaveProperty('value');
      expect(result[0].key).toBe(1.5);
      expect(result[0].label).toBe(1.5);
      expect(result[0].value).toBe(1.5);
    });

    it('should maintain consistent key, label, and value', () => {
      const data = [
        { engineSize: 2.5, doors: 3 },
        { engineSize: 1.8, doors: 5 },
      ];

      const engineResult = getUniqueValues(data, 'engineSize');
      const doorsResult = getUniqueValues(data, 'doors');

      engineResult.forEach((item) => {
        expect(item.key).toBe(item.label);
        expect(item.label).toBe(item.value);
      });

      doorsResult.forEach((item) => {
        expect(item.key).toBe(item.label);
        expect(item.label).toBe(item.value);
      });
    });
  });
});
