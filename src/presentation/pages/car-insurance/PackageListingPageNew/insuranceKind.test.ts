import {
  COMPULSORY_INSURANCE_TYPE,
  getInsuranceKindFromTypes,
  getInsuranceTypesFromLead,
} from './insuranceKind';

describe('insuranceKind helpers', () => {
  describe('getInsuranceKindFromTypes', () => {
    it('returns undefined when no insurance type is selected', () => {
      expect(getInsuranceKindFromTypes([])).toBeUndefined();
    });

    it('returns voluntary when only voluntary types are selected', () => {
      expect(getInsuranceKindFromTypes(['type_1', 'type_2+'])).toBe(
        'voluntary'
      );
    });

    it('returns mandatory when only compulsory is selected', () => {
      expect(getInsuranceKindFromTypes([COMPULSORY_INSURANCE_TYPE])).toBe(
        'mandatory'
      );
    });

    it('returns both when voluntary and compulsory types are selected', () => {
      expect(
        getInsuranceKindFromTypes(['type_1', COMPULSORY_INSURANCE_TYPE])
      ).toBe('both');
    });
  });

  describe('getInsuranceTypesFromLead', () => {
    it('returns voluntary types for voluntary insurance kind', () => {
      expect(getInsuranceTypesFromLead('voluntary', ['type_1'])).toEqual([
        'type_1',
      ]);
    });

    it('adds compulsory for mandatory insurance kind', () => {
      expect(getInsuranceTypesFromLead('mandatory')).toEqual([
        COMPULSORY_INSURANCE_TYPE,
      ]);
    });

    it('adds compulsory for both insurance kind', () => {
      expect(getInsuranceTypesFromLead('both', ['type_1'])).toEqual([
        'type_1',
        COMPULSORY_INSURANCE_TYPE,
      ]);
    });
  });
});
