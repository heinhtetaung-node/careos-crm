import { LeadDetailActionTypes } from 'presentation/redux/actions/leads/detail';

import callReducer, { initialState } from './index';

test('should return the initial state', () => {
  expect(
    callReducer(undefined, { type: LeadDetailActionTypes.INITIAL_CALL })
  ).toEqual(initialState);
});

test('should return updated audio stream', () => {
  const expectedState = {
    ...initialState,
    data: {
      ...initialState.data,
      audioStream: 'test',
    },
  };
  expect(
    callReducer(initialState, {
      type: LeadDetailActionTypes.SET_AUDIO_STREAM,
      payload: 'test',
    })
  ).toEqual(expectedState);
});
