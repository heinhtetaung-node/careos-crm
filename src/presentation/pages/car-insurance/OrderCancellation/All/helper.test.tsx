import React from 'react';
import * as helper from './helper';

jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));

jest.mock('presentation/components/leads/searchField/SearchField', () => (
  <div>
    <input id="searchFieldInput" />
  </div>
));
jest.mock('presentation/components/controls/Control', () => ({
  Autocomplete: () => (
    <div>
      <input id="autocompleteInput" aria-label="Autocomplete" />
    </div>
  ),
  Slider: () => (
    <div>
      <input id="sliderInput" type="range" aria-labelledby="sliderInputLabel" />
    </div>
  ),
  NumberInput: () => (
    <div>
      <input
        id="numberInput"
        type="number"
        aria-labelledby="numberInputLabel"
      />
    </div>
  ),
}));
jest.mock('presentation/components/controls/MultiDateRangeWithType', () => (
  <div>MultiDateRangeWithType</div>
));
jest.mock('../../orders/filter.helper', () => ({
  getInsurersList: jest.fn(() =>
    Promise.resolve([{ name: 'Test', displayName: 'Test' }])
  ),
}));
jest.mock('../../Accounting/All/helper', () => ({
  CancellationStatusOptions: [
    { value: 'completed', title: 'cancellation.completed' },
    { value: 'pending', title: 'cancellation.pending' },
  ],
}));
jest.mock('../../Accounting/All/config', () => ({
  PremiumRemittanceStatusOptions: [
    { value: 'paid', title: 'Paid' },
    { value: 'unpaid', title: 'Unpaid' },
  ],
  refundCalculationMethods: [],
  SearchOptions: [{ key: 1, title: 'Option1', value: 'option1' }],
}));
jest.mock('presentation/components/modal/UserModal/helper', () => ({
  ProductTypeOptions: [
    { value: 'car', title: 'Car' },
    { value: 'bike', title: 'Bike' },
  ],
}));
jest.mock('../../CarePay/common/helper', () => ({
  PaymentTypeOptions: [
    { value: 'cash', title: 'Cash' },
    { value: 'credit', title: 'Credit' },
  ],
}));

describe('helper.tsx', () => {
  it('should return correct urgentRefundReasonOptions', () => {
    expect(helper.urgentRefundReasonOptions).toEqual([
      {
        key: 1,
        title: 'text.customerComplaint',
        value: 'CUSTOMER_COMPLAINT',
      },
      {
        key: 2,
        title: 'text.customerNeedsMoneyToBuyNewInsurance',
        value: 'CUSTOMER_NEEDS_MONEY_TO_BUY_NEW_INSURANCE',
      },
    ]);
  });

  it('should return correct refundProviderOptions', () => {
    expect(helper.refundProviderOptions).toBeDefined();
    expect(Array.isArray(helper.refundProviderOptions)).toBe(true);
    expect(helper.refundProviderOptions.length).toBeGreaterThan(0);

    // Verify structure of refundProviderOptions
    helper.refundProviderOptions.forEach((option) => {
      expect(option).toHaveProperty('value');
      expect(option).toHaveProperty('title');
      expect(option).toHaveProperty('id');
      expect(typeof option.value).toBe('string');
      expect(typeof option.title).toBe('string');
    });

    // Check some expected values
    const providers = helper.refundProviderOptions.map(
      (option) => option.value
    );
    expect(providers).toContain('KASIKORN');
  });

  it('should return correct refundMethodOptions', () => {
    expect(helper.refundMethodOptions).toBeDefined();
    expect(Array.isArray(helper.refundMethodOptions)).toBe(true);
    expect(helper.refundMethodOptions.length).toBeGreaterThan(0);

    // Verify structure of refundMethodOptions
    helper.refundMethodOptions.forEach((option) => {
      expect(option).toHaveProperty('value');
      expect(option).toHaveProperty('title');
      expect(option).toHaveProperty('id');
      expect(typeof option.value).toBe('string');
      expect(typeof option.title).toBe('string');
    });

    // Check for expected payment methods
    const methods = helper.refundMethodOptions.map((option) => option.value);
    expect(methods).toContain('DIRECT_TO_INSURER');
  });

  it('should return correct bankLists', () => {
    expect(helper.bankLists.length).toBeGreaterThan(0);
    expect(helper.bankLists[0]).toHaveProperty('value');
    expect(helper.bankLists[0]).toHaveProperty('label');
    expect(helper.bankLists[0]).toHaveProperty('name');
  });

  it('getFields returns correct structure', () => {
    const fields = helper.getFields();
    expect(Array.isArray(fields)).toBe(true);
    expect(fields[0].InputComponent).toBeDefined();
    expect(fields[0].inputProps.name).toBe('search');
  });

  it('getFieldsV2 returns correct structure', () => {
    const fields = helper.getFieldsV2();
    expect(Array.isArray(fields)).toBe(true);
    expect(fields[0].InputComponent).toBeDefined();
    expect(fields[0].inputProps.name).toBe('search');
    expect(fields.find((f) => f.inputProps?.name === 'insurer')).toBeDefined();
  });

  it('tabConfig returns correct structure', () => {
    expect(Array.isArray(helper.tabConfig)).toBe(true);
    expect(helper.tabConfig[0]).toHaveProperty('id');
    expect(helper.tabConfig[0]).toHaveProperty('title');
  });

  it('pendingCancelSubmissionColumns returns correct columns', () => {
    const columns = helper.pendingCancelSubmissionColumns();
    expect(Array.isArray(columns)).toBe(true);
    expect(columns[0]).toHaveProperty('id');
    expect(columns[0]).toHaveProperty('label');
    expect(columns[0]).toHaveProperty('icon');
  });

  it('customerRequestOptions returns correct options', () => {
    expect(helper.customerRequestOptions.length).toBeGreaterThan(0);
    expect(helper.customerRequestOptions[0]).toHaveProperty('key');
    expect(helper.customerRequestOptions[0]).toHaveProperty('title');
    expect(helper.customerRequestOptions[0]).toHaveProperty('value');
  });

  it('cancellationV2Columns returns correct columns', () => {
    const handleOpenDocument = jest.fn();
    const handleOpenComments = jest.fn();
    const handleOpenRefundForm = jest.fn();
    const handleOpenChangeOrder = jest.fn();
    const columns = helper.cancellationV2Columns(
      handleOpenDocument,
      handleOpenComments,
      handleOpenRefundForm,
      handleOpenChangeOrder
    );
    expect(Array.isArray(columns)).toBe(true);
    expect(columns[0]).toHaveProperty('id');
    expect(columns[0]).toHaveProperty('label');
    expect(
      columns.find((col) => col.id === 'urgentRefundReason')
    ).toBeDefined();
  });

  it('cancellationV2Columns returns correct columns with onlyViewDocument', () => {
    const handleOpenDocument = jest.fn();
    const handleOpenComments = jest.fn();
    const handleOpenRefundForm = jest.fn();
    const handleOpenChangeOrder = jest.fn();
    const columns = helper.cancellationV2Columns(
      handleOpenDocument,
      handleOpenComments,
      handleOpenRefundForm,
      handleOpenChangeOrder,
      true
    );
    expect(Array.isArray(columns)).toBe(true);
    expect(columns[0]).toHaveProperty('id');
    expect(columns[0]).toHaveProperty('label');
    expect(
      columns.find((col) => col.id === 'urgentRefundReason')
    ).toBeDefined();
  });

  it('should return correct mappingFields', () => {
    expect(helper.mappingFields).toBeDefined();
    expect(typeof helper.mappingFields).toBe('object');
    expect(Object.keys(helper.mappingFields).length).toBeGreaterThan(0);
  });

  it('should return correct setFieldsTouched', () => {
    const setFixedData = jest.fn();
    helper.setFieldsTouched('commissionClawback', true, setFixedData);

    // Get the callback function that was passed to setFixedData
    const callback = setFixedData.mock.calls[0][0];

    // Call the callback with a previous state
    const result = callback({});

    // Verify the callback returns the correct object
    expect(result).toEqual({
      commission_clawback: true,
    });

    // Verify setFixedData was called exactly once
    expect(setFixedData).toHaveBeenCalledTimes(1);
  });

  describe('paymentStatus transform', () => {
    const col = helper
      .pendingOnCustomer()
      .find((c) => c.id === 'paymentStatus');

    const baseRow = {
      refundAccountDocument: '',
      idCardDocument: '',
      orderItemId: '',
    };

    it('returns fully paid for paymentStatus true', () => {
      if (col && col.transform) {
        expect(col.transform({ ...baseRow, paymentStatus: true } as any)).toBe(
          'tableListing.fullyPaid'
        );
      }
    });

    it('returns not fully paid for paymentStatus false', () => {
      if (col && col.transform) {
        expect(col.transform({ ...baseRow, paymentStatus: false } as any)).toBe(
          'tableListing.notFullyPaid'
        );
      }
    });

    it('returns dash for paymentStatus undefined/null/other', () => {
      if (col && col.transform) {
        expect(col.transform(baseRow as any)).toBe('-');
        expect(
          col.transform({ ...baseRow, paymentStatus: undefined } as any)
        ).toBe('-');
        expect(col.transform({ ...baseRow, paymentStatus: null } as any)).toBe(
          '-'
        );
        expect(
          col.transform({ ...baseRow, paymentStatus: 'other' } as any)
        ).toBe('-');
      }
    });
  });

  it('checkDisableInsurerAmount disable when availableCreditShell is 0 and usedCreditShell is 0 and paidChargesLength is 0', () => {
    expect(helper.checkDisableInsurerAmount(0, 0, 0)).toBe(true);
  });

  it('checkDisableInsurerAmount enable when availableCreditShell is 0 and usedCreditShell is 0 and paidChargesLength is 1', () => {
    expect(helper.checkDisableInsurerAmount(0, 0, 1)).toBe(false);
  });

  // other case for available credit shell or used credit shell amount more than 0
  it('checkDisableInsurerAmount enable when availableCreditShell is 1 and usedCreditShell is 0 and paidChargesLength is 0', () => {
    expect(helper.checkDisableInsurerAmount(1, 0, 0)).toBe(false);
  });

  it('checkDisableInsurerAmount disable when availableCreditShell is 0 and usedCreditShell is 1 and paidChargesLength is 0', () => {
    expect(helper.checkDisableInsurerAmount(0, 1, 2)).toBe(true);
  });

  it('omitFieldsIfNotChange returns only fixed fields', () => {
    const payload = { a: 1, b: 2, c: 3 };
    const fixedData = { a: true, b: false, c: true };
    expect(helper.omitFieldsIfNotChange(payload, fixedData)).toEqual({
      a: 1,
      c: 3,
    });
  });

  describe('checkDisableInsurerAmount', () => {
    it('returns false if availableCreditShell > 0', () => {
      expect(helper.checkDisableInsurerAmount(1, 0, 0)).toBe(false);
      expect(helper.checkDisableInsurerAmount('2', 0, 0)).toBe(false);
    });
    it('returns false if availableCreditShell and usedCreditShell are 0 and paidChargesLength > 0', () => {
      expect(helper.checkDisableInsurerAmount(0, 0, 1)).toBe(false);
      expect(helper.checkDisableInsurerAmount('0', '0', 2)).toBe(false);
    });
    it('returns true if availableCreditShell and usedCreditShell are 0 and paidChargesLength is 0', () => {
      expect(helper.checkDisableInsurerAmount(0, 0, 0)).toBe(true);
      expect(helper.checkDisableInsurerAmount('0', '0', 0)).toBe(true);
    });
    it('returns true for other cases', () => {
      expect(helper.checkDisableInsurerAmount(0, 1, 0)).toBe(true);
      expect(helper.checkDisableInsurerAmount('0', '1', 0)).toBe(true);
    });
  });

  describe('getRefundAmountField', () => {
    const fakeCurrencyToMoney = (v: number) => ({ amount: v, currency: 'THB' });

    it('returns object for positive value', () => {
      expect(helper.getRefundAmountField(1234, fakeCurrencyToMoney)).toEqual({
        amount: 1234,
        currency: 'THB',
      });
    });

    it('returns object for zero', () => {
      expect(helper.getRefundAmountField(0, fakeCurrencyToMoney)).toEqual({
        amount: 0,
        currency: 'THB',
      });
    });

    it('returns undefined for undefined', () => {
      expect(
        helper.getRefundAmountField(undefined, fakeCurrencyToMoney)
      ).toBeUndefined();
    });

    it('returns undefined for null', () => {
      expect(
        helper.getRefundAmountField(null, fakeCurrencyToMoney)
      ).toBeUndefined();
    });
  });
});
