import {
  getDiscountAmount,
  getPolicyId,
  modifyPolicySaveData,
} from './Insurance.helper';

describe('modifyPolicySaveData', () => {
  it('should return undefined', () => {
    const stateValues = {
      policyStartDate: '2009-02-01T00:00:00Z',
      adjustedPremium: '10',
    };
    const changedValue = {
      policyDate: '01/02/2009',
      adjustedPremium: '0.10',
    };
    const value = modifyPolicySaveData(
      'demo orderId',
      'demo policyId',
      changedValue,
      stateValues
    );

    expect(value).toBeUndefined();
  });

  it('should have the full changes in payload', () => {
    const stateValues = {
      policyStartDate: '2009-02-01T00:00:00Z',
      adjustedPremium: '20',
      applicationNumber: '',
    };

    const changedValue = {
      policyDate: '01/02/2010', // MM/DD/YYYY
      adjustedPremium: '0.10',
      applicationNumber: 'RABAPI23050800007',
    };

    const value = modifyPolicySaveData(
      'demo orderId',
      'demo policyId',
      changedValue,
      stateValues
    );

    expect(value).toEqual({
      orderId: 'demo orderId',
      policyId: 'demo policyId',
      policyStartDate: '2010-02-01T00:00:00.000Z',
      adjustedPremium: 10,
      applicationNumber: 'RABAPI23050800007',
    });
  });

  it('should send the policyStartDate', () => {
    const stateValues = {
      policyStartDate: '2009-02-01T00:00:00Z',
      adjustedPremium: '10',
    };
    const changedValue = {
      policyDate: '01/02/2010', // MM/DD/YYYY
      adjustedPremium: '0.10',
    };
    const value = modifyPolicySaveData(
      'demo orderId',
      'demo policyId',
      changedValue,
      stateValues
    );

    expect(value).toEqual({
      orderId: 'demo orderId',
      policyId: 'demo policyId',
      policyStartDate: '2010-02-01T00:00:00.000Z',
    });
  });

  it('should send the adjustedPremium', () => {
    const stateValues = {
      policyStartDate: '2009-02-01T00:00:00Z',
      adjustedPremium: '10',
    };
    const changedValue = {
      policyDate: '01/02/2009',
      adjustedPremium: '0.20',
    };
    const value = modifyPolicySaveData(
      'demo orderId',
      'demo policyId',
      changedValue,
      stateValues
    );

    expect(value).toEqual({
      orderId: 'demo orderId',
      policyId: 'demo policyId',
      adjustedPremium: 20,
    });
  });
});

test('getDiscountAmount', () => {
  const value = getDiscountAmount(['1', '6', '8', '4', '1', '6']);
  expect(value).toBe('0.26');
});

test('getPolicyId', () => {
  const value = getPolicyId(
    'orders/f9000953-f8a1-4cfd-a8b6-df760e6624cb/items/3649d9b1-a616-48a4-85ce-2adff5911af7'
  );
  expect(value).toBe('3649d9b1-a616-48a4-85ce-2adff5911af7');
});
