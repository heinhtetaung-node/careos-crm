import { Lead } from 'shared/types/lead';

import { UpdateRules } from './rules';
import {
  generatePayloadFromRules,
  getUpdateCustomerPayload,
} from './updateRules';

import { PurchasingPurposes } from '../CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';

describe('generatePayloadFromRule', () => {
  it('should add extra param if the rule specified', () => {
    const result = generatePayloadFromRules(
      [{ op: 'add', path: '/carSubModelYear', value: 2022 }],
      { data: { checkout: { package: '1234' } } } as any,
      UpdateRules
    );
    expect(result).toEqual([
      { op: 'remove', path: '/checkout/package', value: null },
    ]);
  });

  it('should no add extra param if there condition if false', () => {
    const result = generatePayloadFromRules(
      [{ op: 'add', path: '/carSubModelYear', value: 2022 }],
      { data: { checkout: {} } } as any,
      UpdateRules
    );
    expect(result).toEqual([]);
  });

  it('should not capture if operaton is outside of catchOp', () => {
    const result = generatePayloadFromRules(
      [{ op: 'remove', path: '/carSubModelYear', value: 2022 }],
      { data: { checkout: {} } } as any,
      UpdateRules
    );
    expect(result).toEqual([]);
  });

  it('should not capture if path is outside of rules', () => {
    const result = generatePayloadFromRules(
      [{ op: 'remove', path: '/somepath', value: 2022 }],
      { data: { checkout: {} } } as any,
      UpdateRules
    );
    expect(result).toEqual([]);
  });

  it('should update both policy holder firstName and address on customer update if policyholder is customer', () => {
    const result1 = generatePayloadFromRules(
      [{ op: 'add', path: '/customerFirstName', value: 'firstName' }],
      {
        data: {
          policyHolderType: PurchasingPurposes.customerIsPolicyHolder,
          customerPolicyAddress: [],
        },
      } as any,
      UpdateRules
    );
    expect(result1).toEqual([
      { op: 'add', path: '/policyHolderFirstName', value: 'firstName' },
    ]);
    const result2 = generatePayloadFromRules(
      [{ op: 'add', path: '/customerFirstName', value: 'firstName' }],
      {
        data: {
          policyHolderType: PurchasingPurposes.customerIsPolicyHolder,
          customerPolicyAddress: [
            { addressType: 'personal', firstName: '', lastName: '' },
          ],
        },
      } as any,
      UpdateRules
    );
    expect(result2).toEqual([
      { op: 'add', path: '/policyHolderFirstName', value: 'firstName' },
      {
        op: 'add',
        path: '/customerPolicyAddress/0/firstName',
        value: 'firstName',
      },
    ]);
  });

  it('should update both policy holder lastName and address on customer update if policyholder is customer', () => {
    const result1 = generatePayloadFromRules(
      [{ op: 'add', path: '/customerLastName', value: 'lastName' }],
      {
        data: {
          policyHolderType: PurchasingPurposes.customerIsPolicyHolder,
          customerPolicyAddress: [],
        },
      } as any,
      UpdateRules
    );
    expect(result1).toEqual([
      { op: 'add', path: '/policyHolderLastName', value: 'lastName' },
    ]);
    const result2 = generatePayloadFromRules(
      [{ op: 'add', path: '/customerLastName', value: 'lastName' }],
      {
        data: {
          policyHolderType: PurchasingPurposes.customerIsPolicyHolder,
          customerPolicyAddress: [
            { addressType: 'personal', firstName: '', lastName: '' },
          ],
        },
      } as any,
      UpdateRules
    );
    expect(result2).toEqual([
      { op: 'add', path: '/policyHolderLastName', value: 'lastName' },
      {
        op: 'add',
        path: '/customerPolicyAddress/0/lastName',
        value: 'lastName',
      },
    ]);
  });

  it('should update both policy holder lastName and address on customer update if policyholder is customer', () => {
    const result1 = generatePayloadFromRules(
      [{ op: 'add', path: '/customerDOB', value: '2022-02-02' }],
      {
        data: {
          policyHolderType: PurchasingPurposes.customerIsPolicyHolder,
          customerPolicyAddress: [],
        },
      } as any,
      UpdateRules
    );
    expect(result1).toEqual([
      { op: 'add', path: '/policyHolderDOB', value: '2022-02-02' },
    ]);
  });

  it('should clear checkout if insurancekind change', () => {
    const result = generatePayloadFromRules(
      [{ op: 'add', path: '/insuranceKind', value: 'MANDATORY' }],
      {
        data: {
          checkout: {
            package: '1234',
            paymentMethod: 'QR_CODE',
            installments: 1,
            paymentOption: 'FULL_PAYMENT',
          },
        },
      } as any,
      UpdateRules
    );
    expect(result).toEqual([
      { op: 'remove', path: '/checkout/package', value: null },
      { op: 'remove', path: '/checkout/installments', value: null },
      { op: 'remove', path: '/checkout/paymentOption', value: null },
      { op: 'remove', path: '/checkout/paymentMethod', value: null },
    ]);
  });
});

describe('shouldUpdateCustomerPayload', () => {
  it('should return empty obj if customer is not mapped', () => {
    const result = getUpdateCustomerPayload(
      '/customerFirstName',
      'firstName',
      'add',
      {} as Lead
    );
    expect(result).toEqual({});
  });
  it('should return payload if customer is mapped', () => {
    const result = getUpdateCustomerPayload(
      '/customerFirstName',
      'firstName',
      'add',
      {} as Lead,
      { name: 'customers/id/leads/id' }
    );
    expect(result).toEqual({ firstName: 'firstName' });
  });
});
