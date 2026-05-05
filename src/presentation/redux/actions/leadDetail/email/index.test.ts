import {
  getMailReadCount,
  getMailReadCountSuccess,
  LeadActionTypes,
  mailReadCountIncrement,
  mailReadCountDecrement,
} from '.';

const mockPayload = {
  unReadCount: 0,
};

describe('mail read count Actions', () => {
  test('getMailReadCount action', () => {
    const action = {
      type: LeadActionTypes.GET_MAIL_READ_COUNT,
      payload: mockPayload,
    };
    expect(getMailReadCount({ payload: mockPayload })).toEqual(action);
  });

  test('getMailReadCountSuccess action', () => {
    const action = {
      type: LeadActionTypes.GET_MAIL_READ_COUNT_SUCCESS,
      payload: {},
    };
    expect(getMailReadCountSuccess({})).toEqual(action);
  });

  test('mailReadCountIncrement action', () => {
    const action = {
      type: LeadActionTypes.INCREMENT_MAIL_READ_COUNT,
    };
    expect(mailReadCountIncrement()).toEqual(action);
  });

  test('mailReadCountDecrement action', () => {
    const action = {
      type: LeadActionTypes.DECREMENT_MAIL_READ_COUNT,
    };
    expect(mailReadCountDecrement()).toEqual(action);
  });
});
