import { LeadActionTypes } from '../../../actions/leadDetail/email';

import emailReducer, { initialState } from './index';

const state = {
  data: {
    loading: false,
    emails: [],
    fileUploadUrl: '',
    unReadMails: 2,
  },
  isFetching: false,
  success: true,
  status: '',
  actionType: '',
};

test('should return the initial state', () => {
  expect(emailReducer(undefined, { type: 'test' })).toEqual(initialState);
});

test('should return updated un-read mail count', () => {
  const expectedState = {
    ...initialState,
    data: {
      ...initialState.data,
      unReadMails: 10,
    },
  };
  expect(
    emailReducer(initialState, {
      type: LeadActionTypes.GET_MAIL_READ_COUNT_SUCCESS,
      payload: { count: 10 },
    })
  ).toEqual(expectedState);
});

test('should return un-read mail count 0 in case of wrong payload', () => {
  const expectedState = {
    ...initialState,
    data: {
      ...initialState.data,
      unReadMails: 0,
    },
  };
  expect(
    emailReducer(initialState, {
      type: LeadActionTypes.GET_MAIL_READ_COUNT_SUCCESS,
      payload: {},
    })
  ).toEqual(expectedState);
});

test('should return incremented un-read mail count', () => {
  const expectedState = {
    ...initialState,
    data: {
      ...initialState.data,
      unReadMails: 1,
    },
  };
  expect(
    emailReducer(initialState, {
      type: LeadActionTypes.INCREMENT_MAIL_READ_COUNT,
    })
  ).toEqual(expectedState);
});

test('should return decrement un-read mail count when un-read mail count greater than zero', () => {
  const expectedState = {
    ...state,
    data: {
      ...state.data,
      unReadMails: 1,
    },
  };
  expect(
    emailReducer(state, {
      type: LeadActionTypes.DECREMENT_MAIL_READ_COUNT,
    })
  ).toEqual(expectedState);
});

test('should return un-read mail count zero when un-read mail count already zero', () => {
  const expectedState = {
    ...initialState,
    data: {
      ...initialState.data,
      unReadMails: 0,
    },
  };
  expect(
    emailReducer(initialState, {
      type: LeadActionTypes.DECREMENT_MAIL_READ_COUNT,
    })
  ).toEqual(expectedState);
});
