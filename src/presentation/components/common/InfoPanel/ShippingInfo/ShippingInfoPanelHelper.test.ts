import { isPolicyModify } from './ShippingInfoPanel.helper';

test('Should isPolicyModify is true when tracking number is changed', () => {
  const isVoluntary = true;
  const values = {
    trackingNum: 'TESTING-TRACKING-221',
    voluntaryPolicyNum: '23232323',
  };
  const policyState = {
    trackingNumber: 'TESTING-TRACKING-222',
    policyNumber: '23232323',
  };

  expect(isPolicyModify(isVoluntary, values, policyState)).toBe(true);
});

test('Should isPolicyModify is true when policy number is changed (voluntary)', () => {
  const isVoluntary = true;
  const values = {
    trackingNum: 'TESTING-TRACKING-222',
    voluntaryPolicyNum: '23232',
  };
  const policyState = {
    trackingNumber: 'TESTING-TRACKING-222',
    policyNumber: '23232323',
  };

  expect(isPolicyModify(isVoluntary, values, policyState)).toBe(true);
});

test('Should isPolicyModify is true when policy number is changed (manadatory)', () => {
  const isVoluntary = false;
  const values = {
    trackingNum: 'TESTING-TRACKING-222',
    mandatoryPolicyNum: '23232',
  };
  const policyState = {
    trackingNumber: 'TESTING-TRACKING-222',
    policyNumber: '23232323',
  };

  expect(isPolicyModify(isVoluntary, values, policyState)).toBe(true);
});

test('Should isPolicyModify is false when policy is not modified', () => {
  const isVoluntary = true;
  const values = {
    trackingNum: 'TESTING-TRACKING-222',
    voluntaryPolicyNum: '23232323',
  };
  const policyState = {
    trackingNumber: 'TESTING-TRACKING-222',
    policyNumber: '23232323',
  };

  expect(isPolicyModify(isVoluntary, values, policyState)).toBe(false);
});
