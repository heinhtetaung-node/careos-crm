import { add } from 'date-fns';

import {
  errorMessage,
  getPayloadForPolicyHolder,
  INSURANCE_KIND,
  isAfterCurrent,
  isAfterSixMonth,
  isDisabled,
  POLICY_TYPE,
} from 'presentation/components/InsurerInfoSection/InsurerInfoSection.helper';
import { getString } from 'presentation/theme/localization';

describe('Test isAfterCurrent', () => {
  let date: any;
  beforeEach(() => {
    date = '12/12/1996';
  });

  it('Should be return true if input after current', () => {
    expect(isAfterCurrent(date)).toEqual(true);
  });

  it('Should be return false if input is today', () => {
    expect(isAfterCurrent(new Date().toISOString())).toEqual(false);
  });

  it('Should be return false if input not after current', () => {
    date = add(new Date(), { years: 1 });
    expect(isAfterCurrent(date)).toEqual(false);
  });
});

describe('Test isAfterSixMonth', () => {
  it('Should be return false if input not after current 6 month', () => {
    expect(isAfterSixMonth(new Date().toISOString())).toEqual(false);
  });

  it('Should be return true if input after current 6 month', () => {
    const date = add(new Date(), { months: 7 }).toISOString();
    expect(isAfterSixMonth(date)).toEqual(true);
  });
});

describe('test errorMessage', () => {
  it('Should be return error when compare with current date', () => {
    expect(errorMessage('12/12/1996')).toEqual(
      getString('text.invalidDateWithCurrent')
    );
  });
  it('Should be return error when compare with current date', () => {
    expect(errorMessage(add(new Date(), { months: 7 }) as any)).toEqual(
      getString('text.invalidDateFromCurrent', { month: 7 })
    );
  });

  it('Should be return success when input valid', () => {
    expect(errorMessage(add(new Date(), { days: 1 }) as any)).toEqual('');
  });
});

describe('Test getPayloadForPolicyHolder', () => {
  it('Should be return value when policy type is "POLICY_START_DATE"', () => {
    expect(
      getPayloadForPolicyHolder(POLICY_TYPE.POLICY_START_DATE, '')
    ).toEqual([
      {
        op: 'add',
        path: '/policyStartDate',
        value: '',
      },
    ]);
  });
  it('Should be return value when policy type is "COMPULSORY_POLICY_START_DATE"', () => {
    expect(
      getPayloadForPolicyHolder(POLICY_TYPE.COMPULSORY_POLICY_START_DATE, '')
    ).toEqual([
      {
        op: 'add',
        path: '/compulsoryPolicyStartDate',
        value: '',
      },
    ]);
  });
});

describe('Test isDisabled', () => {
  it('Should be return false if insuranceKind is "both" and have policyType is "policyStartDate"', () => {
    expect(
      isDisabled(INSURANCE_KIND.BOTH, POLICY_TYPE.POLICY_START_DATE)
    ).toEqual(false);
  });
  it('Should be return false if insuranceKind is "voluntary" and have policyType is "policyStartDate"', () => {
    expect(
      isDisabled(INSURANCE_KIND.VOLUNTARY, POLICY_TYPE.POLICY_START_DATE)
    ).toEqual(false);
  });
  it('Should be return false if insuranceKind is "both" and have policyType is "compulsoryPolicyStartDate"', () => {
    expect(
      isDisabled(INSURANCE_KIND.BOTH, POLICY_TYPE.COMPULSORY_POLICY_START_DATE)
    ).toEqual(false);
  });
  it('Should be return false if insuranceKind is "mandatory" and have policyType is "compulsoryPolicyStartDate"', () => {
    expect(
      isDisabled(
        INSURANCE_KIND.MANDATORY,
        POLICY_TYPE.COMPULSORY_POLICY_START_DATE
      )
    ).toEqual(false);
  });
  it('Should be return false if we not pass any policyType', () => {
    expect(isDisabled(INSURANCE_KIND.MANDATORY, '' as any)).toEqual(false);
  });
});
