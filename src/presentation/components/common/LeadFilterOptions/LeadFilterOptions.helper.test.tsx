import {
  defaultYesNoOptions,
  genderOptions,
  languageOptions,
  ALLOWED_FIXED_DRIVER_COUNTS,
  getFieldTitle,
  getFieldTooltip,
  getFieldOptions,
  getFieldMeta,
  handleUpdateLead,
  handlePolicyHolderTypeChange,
  policyDateValidation,
  dobValidation,
  runValidation,
} from './LeadFilterOptions.helper';
import {
  defaultData,
  policyHolderTypeChangeTestCases,
  defaultCaseTestCases,
  policyTitleArrayValue,
  policyTitleSingleValue,
  policyTitleValueWithoutValueProp,
  policyTitleExpectedArrayResult,
} from '../../../../mock-data/LeadFilterOptionsHelper.mock';

jest.mock('presentation/theme/localization', () => ({
  getString: jest.fn((key, params) => {
    // Map commonly used keys in this test to human-readable strings
    if (key === 'leadFilter.yes') return 'Yes';
    if (key === 'leadFilter.no') return 'No';
    if (key === 'text.male') return 'Male';
    if (key === 'text.female') return 'Female';
    if (key === 'text.thai') return 'Thai';
    if (key === 'leadFilter.english') return 'English';

    if (key === 'text.invalidDateFromCurrent' && params) {
      return `Date cannot be more than 6 months from current date. Maximum allowed date: ${params.dateAfterSixMonths}`;
    }
    if (key === 'text.invalidDateWithCurrent') {
      return 'Date cannot be in the past';
    }
    if (key === 'errors.invalidAgeUnder') {
      return 'Age cannot be less than 18 years old';
    }
    if (key === 'errors.invalidAgeOver') {
      return 'Age cannot be more than 100 years old';
    }
    return key;
  }),
}));
jest.mock(
  'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper',
  () => ({
    PurchasingPurposes: {
      customerIsPolicyHolder: 'customer',
      companyIsPolicyHolder: 'company',
      individual: 'individual',
    },
  })
);
describe('LeadFilterOptions Helper', () => {
  describe('Constants', () => {
    it('exports all constants correctly', () => {
      expect(defaultYesNoOptions).toEqual([
        { key: 'true', label: 'Yes', value: 'true' },
        { key: 'false', label: 'No', value: 'false' },
      ]);
      expect(genderOptions).toEqual([
        { key: 'm', label: 'Male' },
        { key: 'f', label: 'Female' },
      ]);
      expect(languageOptions).toEqual([
        { key: 'th-th', label: 'Thai' },
        { key: 'th-en', label: 'English' },
      ]);
      expect(ALLOWED_FIXED_DRIVER_COUNTS).toEqual([0, 1, 2]);
    });
  });
  describe('getFieldTitle', () => {
    it('handles all title scenarios', () => {
      const config = { testField: { title: 'Custom Title' } };
      expect(getFieldTitle(config, 'testField', 'fallback.key')).toBe(
        'Custom Title'
      );
      expect(getFieldTitle({}, 'testField', 'fallback.key')).toBe(
        'fallback.key'
      );
      expect(
        getFieldTitle({ testField: {} }, 'testField', 'fallback.key')
      ).toBe('fallback.key');
    });
  });
  describe('getFieldTooltip', () => {
    it('returns localized tooltip key by field', () => {
      expect(getFieldTooltip('testField')).toBe('leadFilter.tooltip.testField');
      expect(getFieldTooltip('policyHolderDOB')).toBe(
        'leadFilter.tooltip.policyHolderDOB'
      );
    });
  });
  describe('getFieldOptions', () => {
    it('handles all options scenarios', () => {
      const config = { testField: { options: [{ value: 'opt1' }] } };
      const fallbackOptions = [{ value: 'fallback1' }];
      expect(getFieldOptions(config, 'testField', [])).toEqual([
        { value: 'opt1' },
      ]);
      expect(getFieldOptions({}, 'testField', fallbackOptions)).toEqual(
        fallbackOptions
      );
      expect(getFieldOptions({}, 'testField')).toEqual([]);
      expect(getFieldOptions({ testField: {} }, 'testField', [])).toEqual([]);
    });
  });
  describe('getFieldMeta', () => {
    it('handles hidden fields for company policy holder', () => {
      const companyData = { policyHolderType: 'company' };
      const hiddenFields = [
        'policyTitle',
        'policyHolderFirstName',
        'policyHolderLastName',
        'policyHolderNationalId',
        'policyHolderDOB',
        'policyHolderAge',
      ];
      hiddenFields.forEach((field) => {
        const result = getFieldMeta(field, companyData);
        expect(result.hidden).toBe(true);
        expect(result.readOnly).toBe(false);
      });
    });
    it('handles company-specific fields visibility', () => {
      const companyData = { policyHolderType: 'company' };
      const individualData = { policyHolderType: 'individual' };
      expect(getFieldMeta('policyHolderCompanyName', companyData).hidden).toBe(
        false
      );
      expect(getFieldMeta('policyHolderTaxId', companyData).hidden).toBe(false);
      expect(
        getFieldMeta('policyHolderCompanyName', individualData).hidden
      ).toBe(true);
      expect(getFieldMeta('policyHolderTaxId', individualData).hidden).toBe(
        true
      );
    });
    it('handles readOnly fields for customer policy holder', () => {
      const customerData = { policyHolderType: 'customer' };
      const readOnlyFields = [
        'policyHolderFirstName',
        'policyHolderLastName',
        'policyHolderDOB',
        'policyTitle',
      ];
      readOnlyFields.forEach((field) => {
        const result = getFieldMeta(field, customerData);
        expect(result.hidden).toBe(false);
        expect(result.readOnly).toBe(true);
      });
    });
    it('handles edge cases and unknown fields', () => {
      const testCases = [undefined, null, {}, { policyHolderType: 'customer' }];
      const testField = 'unknownField';
      testCases.forEach((currentData) => {
        const result = getFieldMeta(testField, currentData);
        expect(result.hidden).toBe(false);
        expect(result.readOnly).toBe(false);
      });
    });
  });
  describe('policyDateValidation', () => {
    var mockSetWarning: jest.Mock;
    beforeEach(() => {
      mockSetWarning = jest.fn();
    });
    it('returns true for empty dates', () => {
      const result = policyDateValidation('', mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).not.toHaveBeenCalled();
    });
    it('returns true for null dates', () => {
      const result = policyDateValidation(null as any, mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).not.toHaveBeenCalled();
    });
    it('returns true for undefined dates', () => {
      const result = policyDateValidation(undefined as any, mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).not.toHaveBeenCalled();
    });
    it('returns false for dates more than 6 months in the future', () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 7);
      const dateString = futureDate.toISOString().split('T')[0];
      const result = policyDateValidation(dateString, mockSetWarning);
      expect(result).toBe(false);
      expect(mockSetWarning).toHaveBeenCalledWith(
        expect.stringContaining(
          'Date cannot be more than 6 months from current date'
        )
      );
    });
    it('returns false for dates in the past', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const dateString = pastDate.toISOString().split('T')[0];
      const result = policyDateValidation(dateString, mockSetWarning);
      expect(result).toBe(false);
      expect(mockSetWarning).toHaveBeenCalledWith('Date cannot be in the past');
    });
    it('returns true for valid dates (today)', () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      const result = policyDateValidation(dateString, mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).toHaveBeenCalledWith('');
    });
    it('returns true for valid dates (within 6 months)', () => {
      const validDate = new Date();
      validDate.setMonth(validDate.getMonth() + 1);
      validDate.setHours(0, 0, 0, 0);
      const dateString = validDate.toISOString().split('T')[0];
      const result = policyDateValidation(dateString, mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).toHaveBeenCalledWith('');
    });
    it('returns true for valid dates (exactly 6 months)', () => {
      const validDate = new Date();
      validDate.setMonth(validDate.getMonth() + 6);
      validDate.setHours(23, 59, 59, 999);
      const dateString = validDate.toISOString().split('T')[0];
      const result = policyDateValidation(dateString, mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).toHaveBeenCalledWith('');
    });
  });

  describe('dobValidation', () => {
    var mockSetWarning: jest.Mock;
    beforeEach(() => {
      mockSetWarning = jest.fn();
    });
    it('returns true for empty values', () => {
      const result = dobValidation('', mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).not.toHaveBeenCalled();
    });
    it('returns true for null values', () => {
      const result = dobValidation(null as any, mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).not.toHaveBeenCalled();
    });
    it('returns true for undefined values', () => {
      const result = dobValidation(undefined as any, mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).not.toHaveBeenCalled();
    });
    it('returns false for age less than 18 (same month, day before birthday)', () => {
      const today = new Date();
      const birthDate = new Date();
      birthDate.setFullYear(today.getFullYear() - 17);
      birthDate.setDate(today.getDate() + 1);
      const dateString = birthDate.toISOString().split('T')[0];
      const result = dobValidation(dateString, mockSetWarning);
      expect(result).toBe(false);
      expect(mockSetWarning).toHaveBeenCalledWith(
        'Age cannot be less than 18 years old'
      );
    });
    it('returns false for age less than 18 (different month, earlier in year)', () => {
      const today = new Date();
      const birthDate = new Date();
      birthDate.setFullYear(today.getFullYear() - 17);
      birthDate.setMonth(today.getMonth() + 1);
      const dateString = birthDate.toISOString().split('T')[0];
      const result = dobValidation(dateString, mockSetWarning);
      expect(result).toBe(false);
      expect(mockSetWarning).toHaveBeenCalledWith(
        'Age cannot be less than 18 years old'
      );
    });
    it('returns true for age exactly 18 (same month, same day)', () => {
      const today = new Date();
      const birthDate = new Date();
      birthDate.setFullYear(today.getFullYear() - 18);
      const dateString = birthDate.toISOString().split('T')[0];
      const result = dobValidation(dateString, mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).toHaveBeenCalledWith('');
    });
    it('returns true for age exactly 18 (same month, day after birthday)', () => {
      const today = new Date();
      const birthDate = new Date();
      birthDate.setFullYear(today.getFullYear() - 18);
      birthDate.setDate(today.getDate() - 1);
      const dateString = birthDate.toISOString().split('T')[0];
      const result = dobValidation(dateString, mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).toHaveBeenCalledWith('');
    });
    it('returns true for age exactly 18 (different month, earlier in year)', () => {
      const today = new Date();
      const birthDate = new Date();
      birthDate.setFullYear(today.getFullYear() - 18);
      birthDate.setMonth(today.getMonth() - 1);
      const dateString = birthDate.toISOString().split('T')[0];
      const result = dobValidation(dateString, mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).toHaveBeenCalledWith('');
    });
    it('returns true for age greater than 18', () => {
      const today = new Date();
      const birthDate = new Date();
      birthDate.setFullYear(today.getFullYear() - 25);
      const dateString = birthDate.toISOString().split('T')[0];
      const result = dobValidation(dateString, mockSetWarning);
      expect(result).toBe(true);
      expect(mockSetWarning).toHaveBeenCalledWith('');
    });
    it('handles leap year edge cases correctly', () => {
      const leapYearDate = '2000-02-29';
      const today = new Date('2024-02-28');
      const originalDate = global.Date;
      global.Date = class extends Date {
        constructor(...args: ConstructorParameters<typeof Date>) {
          if (!args.length) {
            super(today);
          } else {
            super(...args);
          }
        }
      } as any;
      const result = dobValidation(leapYearDate, mockSetWarning);
      global.Date = originalDate;
      expect(result).toBe(true);
      expect(mockSetWarning).toHaveBeenCalledWith('');
    });
  });
  describe('handleUpdateLead', () => {
    const mockUpdateLead = jest.fn();
    const mockJsonUpdater = jest.fn().mockResolvedValue({ data: {} });
    beforeEach(() => {
      mockUpdateLead.mockClear();
      mockJsonUpdater.mockClear();
      mockJsonUpdater.mockResolvedValue({ data: {} });
    });
    it('handles all switch cases correctly', async () => {
      await expect(
        handleUpdateLead(
          'policyHolderAge',
          '25',
          mockUpdateLead,
          mockJsonUpdater
        )
      ).resolves.toBe(true);
      expect(mockUpdateLead).not.toHaveBeenCalled();
      await handleUpdateLead(
        'redPlate',
        'true',
        mockUpdateLead,
        mockJsonUpdater
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        '/carLicensePlate',
        'redplate'
      );
      await handleUpdateLead(
        'redPlate',
        'false',
        mockUpdateLead,
        mockJsonUpdater
      );
      expect(mockUpdateLead).toHaveBeenCalledWith('/carLicensePlate', '');
      await handleUpdateLead(
        'customerLanguage',
        'th-th',
        mockUpdateLead,
        mockJsonUpdater
      );
      expect(mockUpdateLead).toHaveBeenCalledWith('/locale', 'th-th');
      await handleUpdateLead(
        'policyHolderCompanyName',
        'Test Company',
        mockUpdateLead,
        mockJsonUpdater
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        '/customerPolicyAddress/0/companyName',
        'Test Company'
      );
      await handleUpdateLead(
        'policyHolderTaxId',
        '123456789',
        mockUpdateLead,
        mockJsonUpdater
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        '/customerPolicyAddress/0/taxId',
        '123456789'
      );
    });
    it('handles policyTitle array and non-array values', async () => {
      await handleUpdateLead(
        'policyTitle',
        policyTitleArrayValue,
        mockUpdateLead,
        mockJsonUpdater
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        '/policyTitle',
        policyTitleExpectedArrayResult
      );
      await handleUpdateLead(
        'policyTitle',
        policyTitleSingleValue,
        mockUpdateLead,
        mockJsonUpdater
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        '/policyTitle',
        policyTitleSingleValue
      );
      await handleUpdateLead(
        'policyTitle',
        policyTitleValueWithoutValueProp,
        mockUpdateLead,
        mockJsonUpdater
      );
      expect(mockUpdateLead).toHaveBeenCalledWith(
        '/policyTitle',
        policyTitleValueWithoutValueProp
      );
    });
    it('handles default case with various value types', async () => {
      await Promise.all(
        defaultCaseTestCases.map(async ([key, value, expectedValue]) => {
          await handleUpdateLead(
            key as string,
            value,
            mockUpdateLead,
            mockJsonUpdater
          );
          expect(mockUpdateLead).toHaveBeenCalledWith(`/${key}`, expectedValue);
        })
      );
    });
    it('handles error case when updateLead throws an error', async () => {
      const mockErrorUpdateLead = jest
        .fn()
        .mockRejectedValue(new Error('Update failed'));

      const result = await handleUpdateLead(
        'testField',
        'testValue',
        mockErrorUpdateLead,
        mockJsonUpdater
      );

      expect(result).toBe(false);
      expect(mockErrorUpdateLead).toHaveBeenCalledWith(
        '/testField',
        'testValue'
      );
    });

    describe('insuranceKind', () => {
      it('batches /insuranceKind and /voluntaryInsuranceType into one PATCH when changing to mandatory', async () => {
        const result = await handleUpdateLead(
          'insuranceKind',
          'mandatory',
          mockUpdateLead,
          mockJsonUpdater
        );

        expect(result).toBe(true);
        expect(mockJsonUpdater).toHaveBeenCalledTimes(1);
        expect(mockJsonUpdater).toHaveBeenCalledWith([
          { path: '/insuranceKind', op: 'add', value: 'mandatory' },
          { path: '/voluntaryInsuranceType', op: 'add', value: [] },
        ]);
        expect(mockUpdateLead).not.toHaveBeenCalled();
      });

      it('unwraps object value { value: "mandatory" } before batching', async () => {
        await handleUpdateLead(
          'insuranceKind',
          { value: 'mandatory' },
          mockUpdateLead,
          mockJsonUpdater
        );

        expect(mockJsonUpdater).toHaveBeenCalledWith([
          { path: '/insuranceKind', op: 'add', value: 'mandatory' },
          { path: '/voluntaryInsuranceType', op: 'add', value: [] },
        ]);
      });

      it('returns false when the batch PATCH returns an error response', async () => {
        mockJsonUpdater.mockResolvedValueOnce({ error: { status: 500 } });

        const result = await handleUpdateLead(
          'insuranceKind',
          'mandatory',
          mockUpdateLead,
          mockJsonUpdater
        );

        expect(result).toBe(false);
      });

      it.each(['voluntary', 'both'])(
        'patches only /insuranceKind (no voluntary clear) when switching to %s',
        async (kind) => {
          await handleUpdateLead(
            'insuranceKind',
            kind,
            mockUpdateLead,
            mockJsonUpdater
          );

          expect(mockJsonUpdater).toHaveBeenCalledTimes(1);
          expect(mockJsonUpdater).toHaveBeenCalledWith([
            { path: '/insuranceKind', op: 'add', value: kind },
          ]);
          expect(mockUpdateLead).not.toHaveBeenCalled();
        }
      );
    });
  });
  describe('handlePolicyHolderTypeChange', () => {
    const mockSetCurrentMultipleData = jest.fn();
    const mockUpdateLead = jest.fn();
    beforeEach(() => {
      mockSetCurrentMultipleData.mockClear();
      mockUpdateLead.mockClear();
    });
    it.each(policyHolderTypeChangeTestCases)(
      'handles %s policy holder type change',
      (type, input, expected) => {
        handlePolicyHolderTypeChange(
          type,
          input,
          mockSetCurrentMultipleData,
          mockUpdateLead
        );
        expect(mockSetCurrentMultipleData).toHaveBeenCalledWith(expected);
      }
    );
    describe('straw_buyer cases', () => {
      it('handles straw_buyer with policyHolderNationalId present', () => {
        const dataWithNationalId = {
          ...defaultData,
          policyHolderNationalId: '1234567890123',
        };
        handlePolicyHolderTypeChange(
          'straw_buyer',
          dataWithNationalId,
          mockSetCurrentMultipleData,
          mockUpdateLead
        );
        expect(mockUpdateLead).toHaveBeenCalledWith(
          '/policyHolderNationalId',
          '',
          'remove'
        );
        expect(mockSetCurrentMultipleData).toHaveBeenCalledWith({
          policyHolderType: 'straw_buyer',
          policyHolderFirstName: '',
          policyHolderLastName: '',
          policyHolderDOB: '',
          policyTitle: '',
          policyHolderNationalId: '',
        });
      });
      it('handles straw_buyer with policyTitle present', () => {
        const dataWithPolicyTitle = { ...defaultData, policyTitle: 'Mr' };
        handlePolicyHolderTypeChange(
          'straw_buyer',
          dataWithPolicyTitle,
          mockSetCurrentMultipleData,
          mockUpdateLead
        );
        expect(mockUpdateLead).toHaveBeenCalledWith(
          '/policyTitle',
          '',
          'remove'
        );
        expect(mockSetCurrentMultipleData).toHaveBeenCalledWith({
          policyHolderType: 'straw_buyer',
          policyHolderFirstName: '',
          policyHolderLastName: '',
          policyHolderDOB: '',
          policyTitle: '',
        });
      });
      it('handles straw_buyer with both policyHolderNationalId and policyTitle present', () => {
        const dataWithBoth = {
          ...defaultData,
          policyHolderNationalId: '1234567890123',
          policyTitle: 'Mr',
        };
        handlePolicyHolderTypeChange(
          'straw_buyer',
          dataWithBoth,
          mockSetCurrentMultipleData,
          mockUpdateLead
        );
        expect(mockUpdateLead).toHaveBeenCalledWith(
          '/policyHolderNationalId',
          '',
          'remove'
        );
        expect(mockUpdateLead).toHaveBeenCalledWith(
          '/policyTitle',
          '',
          'remove'
        );
        expect(mockSetCurrentMultipleData).toHaveBeenCalledWith({
          policyHolderType: 'straw_buyer',
          policyHolderFirstName: '',
          policyHolderLastName: '',
          policyHolderDOB: '',
          policyTitle: '',
          policyHolderNationalId: '',
        });
      });
      it('handles straw_buyer with neither policyHolderNationalId nor policyTitle present', () => {
        const dataWithoutBoth = {
          customerFirstName: 'John',
          customerLastName: 'Doe',
          customerDOB: '1990-01-01',
        };
        handlePolicyHolderTypeChange(
          'straw_buyer',
          dataWithoutBoth,
          mockSetCurrentMultipleData,
          mockUpdateLead
        );
        expect(mockUpdateLead).not.toHaveBeenCalled();
        expect(mockSetCurrentMultipleData).toHaveBeenCalledWith({
          policyHolderType: 'straw_buyer',
          policyHolderFirstName: '',
          policyHolderLastName: '',
          policyHolderDOB: '',
          policyTitle: '',
        });
      });
      it('handles straw_buyer with undefined policyHolderNationalId', () => {
        const dataWithUndefinedNationalId = {
          ...defaultData,
          policyHolderNationalId: undefined,
        };
        handlePolicyHolderTypeChange(
          'straw_buyer',
          dataWithUndefinedNationalId,
          mockSetCurrentMultipleData,
          mockUpdateLead
        );
        expect(mockUpdateLead).toHaveBeenCalledWith(
          '/policyTitle',
          '',
          'remove'
        );
        expect(mockSetCurrentMultipleData).toHaveBeenCalledWith({
          policyHolderType: 'straw_buyer',
          policyHolderFirstName: '',
          policyHolderLastName: '',
          policyHolderDOB: '',
          policyTitle: '',
        });
      });
      it('handles straw_buyer with null policyTitle', () => {
        const dataWithNullPolicyTitle = { ...defaultData, policyTitle: null };
        handlePolicyHolderTypeChange(
          'straw_buyer',
          dataWithNullPolicyTitle,
          mockSetCurrentMultipleData,
          mockUpdateLead
        );
        expect(mockUpdateLead).not.toHaveBeenCalled();
        expect(mockSetCurrentMultipleData).toHaveBeenCalledWith({
          policyHolderType: 'straw_buyer',
          policyHolderFirstName: '',
          policyHolderLastName: '',
          policyHolderDOB: '',
          policyTitle: '',
        });
      });
    });
  });
  describe('runValidation', () => {
    let mockSetPolicyStartDateWarning: jest.Mock;
    let mockSetCompulsoryPolicyStartDateWarning: jest.Mock;
    let mockSetCustomerDOBWarning: jest.Mock;
    let mockSetPolicyHolderDOBWarning: jest.Mock;
    beforeEach(() => {
      mockSetPolicyStartDateWarning = jest.fn();
      mockSetCompulsoryPolicyStartDateWarning = jest.fn();
      mockSetCustomerDOBWarning = jest.fn();
      mockSetPolicyHolderDOBWarning = jest.fn();
    });
    it('routes policyStartDate to policyDateValidation', () => {
      const result = runValidation(
        'policyStartDate',
        '2024-06-01',
        mockSetPolicyStartDateWarning,
        mockSetCompulsoryPolicyStartDateWarning,
        mockSetCustomerDOBWarning,
        mockSetPolicyHolderDOBWarning
      );
      expect(typeof result).toBe('boolean');
    });
    it('routes compulsoryPolicyStartDate to policyDateValidation', () => {
      const result = runValidation(
        'compulsoryPolicyStartDate',
        '2024-07-01',
        mockSetPolicyStartDateWarning,
        mockSetCompulsoryPolicyStartDateWarning,
        mockSetCustomerDOBWarning,
        mockSetPolicyHolderDOBWarning
      );
      expect(typeof result).toBe('boolean');
    });
    it('routes customerDOB to dobValidation', () => {
      const result = runValidation(
        'customerDOB',
        '1990-01-01',
        mockSetPolicyStartDateWarning,
        mockSetCompulsoryPolicyStartDateWarning,
        mockSetCustomerDOBWarning,
        mockSetPolicyHolderDOBWarning
      );
      expect(typeof result).toBe('boolean');
    });
    it('routes policyHolderDOB to dobValidation', () => {
      const result = runValidation(
        'policyHolderDOB',
        '1985-01-01',
        mockSetPolicyStartDateWarning,
        mockSetCompulsoryPolicyStartDateWarning,
        mockSetCustomerDOBWarning,
        mockSetPolicyHolderDOBWarning
      );
      expect(typeof result).toBe('boolean');
    });
    it('returns true for unknown field keys', () => {
      const result = runValidation(
        'unknownField',
        'some-value',
        mockSetPolicyStartDateWarning,
        mockSetCompulsoryPolicyStartDateWarning,
        mockSetCustomerDOBWarning,
        mockSetPolicyHolderDOBWarning
      );
      expect(result).toBe(true);
    });
  });
});
