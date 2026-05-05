import {
  formatPriceUnits,
  getPremiumAttrs,
  getPremiumIdFromName,
  initialFilterValues,
} from './helper';

jest.mock('shared/helper/utilities', () => ({
  formatCurrency: jest.fn((value: number, withSymbol?: boolean) =>
    withSymbol ? `THB ${value}` : String(value)
  ),
}));

describe('performanceEnhanced helper', () => {
  describe('initialFilterValues', () => {
    it('has empty arrays for status and team', () => {
      expect(initialFilterValues).toEqual({ status: [], team: [] });
    });
  });

  describe('formatPriceUnits', () => {
    it('formats numeric units via formatCurrency', () => {
      const result = formatPriceUnits('12345');
      expect(result).toBe('THB 12345');
    });

    it('returns original string when units are not numeric', () => {
      expect(formatPriceUnits('abc')).toBe('abc');
      expect(formatPriceUnits('')).toBe('');
    });
  });

  describe('getPremiumAttrs', () => {
    const basePremium = {
      name: 'premiums/123',
      productType: 'motor',
      premiumId: '123',
      price: { currencyCode: 'THB', units: '1000', nanos: 0 },
    } as any;

    it('maps attributes to typed fields and formats maximumannualcoverage', () => {
      const premium = {
        ...basePremium,
        attributes: [
          {
            label: 'insurancetype',
            string: 'Type 1',
            currencyCode: 'THB',
          } as any,
          { label: 'repairtype', string: 'Dealer', currencyCode: 'THB' } as any,
          { label: 'submodel', string: 'Sport', currencyCode: 'THB' } as any,
          {
            label: 'maximumannualcoverage',
            string: '500000',
          } as any,
          { label: 'deductible', string: '1000', currencyCode: 'THB' } as any,
          {
            label: 'display_name',
            string: 'Premium A',
            currencyCode: 'THB',
          } as any,
        ],
      } as any;

      const result = getPremiumAttrs(premium);

      expect(result.insuranceType).toBe('Type 1');
      expect(result.repairType).toBe('Dealer');
      expect(result.submodel).toBe('Sport');
      // 500000 / 100 => 5000, then formatCurrency mock returns "5000"
      expect(result.maximumannualcoverage).toBe('5000');
      expect(result.deductible).toBe('1000');
      expect(result.display_name).toBe('Premium A');
    });

    it('returns empty strings when attributes are missing', () => {
      const premium = {
        ...basePremium,
        attributes: [],
      } as any;

      const result = getPremiumAttrs(premium);
      expect(result).toEqual({
        insuranceType: '',
        repairType: '',
        submodel: '',
        maximumannualcoverage: 'NaN',
        deductible: '',
        display_name: '',
      });
    });

    it('handles empty maximumannualcoverage by returning zero', () => {
      const premium = {
        ...basePremium,
        attributes: [
          {
            label: 'maximumannualcoverage',
            string: '',
          } as any,
        ],
      } as any;

      const result = getPremiumAttrs(premium);
      expect(result.maximumannualcoverage).toBe('0');
    });

    it('maps boolean deductible attributes to string values', () => {
      const premium = {
        ...basePremium,
        attributes: [{ label: 'deductible', bool: true } as any],
      } as any;

      const result = getPremiumAttrs(premium);
      expect(result.deductible).toBe('true');
    });

    it('maps float deductible attributes to string values', () => {
      const premium = {
        ...basePremium,
        attributes: [{ label: 'deductible', float: 500000 } as any],
      } as any;

      const result = getPremiumAttrs(premium);
      expect(result.deductible).toBe('500000');
    });

    it('uses float maximumannualcoverage when string is not present', () => {
      const premium = {
        ...basePremium,
        attributes: [
          {
            label: 'display_name',
            string:
              'Toyota Vios Sedan 4dr Entry CVT 7sp Front Wheel Drive 1.5i 2020',
          },
          {
            label: 'insurancetype',
            string: 'type 2+',
          },
          {
            label: 'maximumannualcoverage',
            float: 20000000,
          },
        ],
      } as any;

      const result = getPremiumAttrs(premium);
      expect(result.maximumannualcoverage).toBe('200000');
      expect(result.display_name).toBe(
        'Toyota Vios Sedan 4dr Entry CVT 7sp Front Wheel Drive 1.5i 2020'
      );
      expect(result.insuranceType).toBe('type 2+');
    });
  });

  describe('getPremiumIdFromName', () => {
    it('strips premiums/ prefix when present', () => {
      expect(getPremiumIdFromName('premiums/abc-123')).toBe('abc-123');
    });

    it('returns name unchanged when no premiums/ prefix', () => {
      expect(getPremiumIdFromName('abc-123')).toBe('abc-123');
    });
  });
});
