import { OICCollection } from './packageStaticData';

describe('packageStaticData', () => {
  describe('OICCollection', () => {
    it('returns base OIC codes without E11 when includeE11 is false', () => {
      const result = OICCollection(false);

      expect(result).not.toContainEqual(
        expect.objectContaining({ id: 'E11', value: 'E11', title: 'E11' })
      );
      expect(result[0]).toEqual({ id: '110', value: '110', title: '110' });
      expect(result).toHaveLength(10);
    });

    it('returns base OIC codes without E11 when called with no argument (default)', () => {
      const result = OICCollection();

      expect(result).not.toContainEqual(
        expect.objectContaining({ id: 'E11', value: 'E11', title: 'E11' })
      );
      expect(result[0]).toEqual({ id: '110', value: '110', title: '110' });
      expect(result).toHaveLength(10);
    });

    it('returns E11 first then base OIC codes when includeE11 is true', () => {
      const result = OICCollection(true);

      expect(result[0]).toEqual({ id: 'E11', value: 'E11', title: 'E11' });
      expect(result[1]).toEqual({ id: '110', value: '110', title: '110' });
      expect(result).toHaveLength(11);
    });
  });
});
