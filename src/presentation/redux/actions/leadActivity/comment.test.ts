import {
  subscribeLeadCommentUpdates,
  subscribeLeadCommentUpdatesSuccess,
} from './comment';

import { LeadActivityTypes } from '.';

const mockPayload = {
  leadName: 'xyz',
};

describe('Lead Activity Comment Actions', () => {
  test('subscribeLeadCommentUpdates action', () => {
    const action = {
      type: LeadActivityTypes.SUBSCRIBE_LEAD_COMMENT_UPDATES,
      payload: mockPayload,
    };
    expect(subscribeLeadCommentUpdates(mockPayload)).toEqual(action);
  });

  test('subscribeLeadCommentUpdatesSuccess action', () => {
    const action = {
      type: LeadActivityTypes.SUBSCRIBE_LEAD_COMMENT_UPDATES_SUCCESS,
      payload: {},
    };
    expect(subscribeLeadCommentUpdatesSuccess({})).toEqual(action);
  });
});
