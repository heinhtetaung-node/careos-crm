import { LeadActivityTypes, subscribeLeadMailUpdates } from '.';

const mockPayload = {
  leadName: 'xyz',
  isApiCallForUnreadMailCountDisabled: false,
};

describe('Lead Activity Comment Actions', () => {
  test('subscribeLeadMailUpdates action', () => {
    const action = {
      type: LeadActivityTypes.SUBSCRIBE_LEAD_MAIL_UPDATES,
      payload: mockPayload,
    };
    expect(subscribeLeadMailUpdates(mockPayload)).toEqual(action);
  });
});
