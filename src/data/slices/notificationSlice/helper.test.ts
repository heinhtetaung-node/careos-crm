import { NotificationTypes } from '@alphafounders/ui';

import { getNotificationTitle, getUrlByType } from './helper';

test('Should get title correct by type', () => {
  expect(getNotificationTitle(NotificationTypes.APPOINTMENT)).toBe(
    'appointment'
  );
  expect(getNotificationTitle(NotificationTypes.LEAD_ASSIGNMENT)).toBe(
    'leadAssigned'
  );
  expect(getNotificationTitle(NotificationTypes.QC_FAILED)).toBe(
    'orderQcFailed'
  );
  expect(getNotificationTitle(NotificationTypes.QC_FIXED)).toBe('orderQcFixed');
});

test('Should get URL correct by type', () => {
  const normalPayload = {
    lead: 'leads/58f85e3c-b2f0-4265-9c1d-35df1703d92e',
  };
  const qcFailedPayload = {
    order: 'orders/58f85e3c-b2f0-4265-9c1d-35df1703d92e',
  };
  expect(getUrlByType(NotificationTypes.APPOINTMENT, normalPayload)).toMatch(
    'leads/58f85e3c-b2f0-4265-9c1d-35df1703d92e'
  );
  expect(getUrlByType(NotificationTypes.QC_FAILED, qcFailedPayload)).toMatch(
    'orders/qc/58f85e3c-b2f0-4265-9c1d-35df1703d92e'
  );
  expect(getUrlByType(NotificationTypes.QC_FIXED, qcFailedPayload)).toMatch(
    'orders/qc/58f85e3c-b2f0-4265-9c1d-35df1703d92e'
  );
  expect(
    getUrlByType(NotificationTypes.APPROVAL_REQUEST, qcFailedPayload)
  ).toMatch('discounts/approval');
});
