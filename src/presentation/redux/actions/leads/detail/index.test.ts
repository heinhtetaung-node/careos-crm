import {
  LeadDetailActionTypes,
  subscribeLeadUpdates,
  initialCall,
  setCallAudioStream,
  createRejection,
  createRejectionSuccess,
  calling,
  connectedCall,
  createRejectionFailed,
  joinCall,
  setTimer,
  failedCall,
  endCall,
} from '.';

describe('Lead Detail Actions', () => {
  test('subscribeLeadUpdates action', () => {
    const mockPayload = {
      leadName: 'xyz',
    };
    const action = {
      type: LeadDetailActionTypes.SUBSCRIBE_LEAD_UPDATES,
      payload: mockPayload,
    };
    expect(subscribeLeadUpdates(mockPayload)).toEqual(action);
  });
  test('initial call action', () => {
    const action = {
      type: LeadDetailActionTypes.INITIAL_CALL,
    };
    expect(initialCall()).toEqual(action);
  });

  test('setCallAudioStream action', () => {
    const mockPayload = {
      active: true,
      id: 'df532346-0bb9-40b2-988d-c5f0a4f38f58',
      onactive: null,
      onaddtrack: null,
      oninactive: null,
      onremovetrack: null,
    };
    const action = {
      type: LeadDetailActionTypes.SET_AUDIO_STREAM,
      payload: mockPayload,
    };
    expect(setCallAudioStream(mockPayload)).toEqual(action);
  });

  test('createRejection action', () => {
    const action = {
      type: LeadDetailActionTypes.CREATE_REJECTION,
    };
    expect(createRejection()).toEqual(action);
  });

  test('createRejectionSuccess action', () => {
    const mockPayload = {};
    const action = {
      type: LeadDetailActionTypes.CREATE_REJECTION_SUCCESS,
      payload: mockPayload,
    };
    expect(createRejectionSuccess(mockPayload)).toEqual(action);
  });

  test('createRejectionFailed action', () => {
    const mockError = 'error';
    const action = {
      type: LeadDetailActionTypes.CREATE_REJECTION_FAILED,
      error: mockError,
    };
    expect(createRejectionFailed(mockError)).toEqual(action);
  });

  test('calling action', () => {
    const getPeerConnection = () => null;
    const mockPayload = { peerConnection: getPeerConnection(), phoneIndex: 0 };
    const action = {
      type: LeadDetailActionTypes.CALLING,
      payload: mockPayload,
    };
    expect(calling(mockPayload)).toEqual(action);
  });

  test('connectedCall action', () => {
    const mockPayload = {
      callName: '',
      sdpAnswer: {},
      sdpAnswerResource: '',
    };
    const action = {
      type: LeadDetailActionTypes.CONNECTED_CALL,
      payload: mockPayload,
    };
    expect(connectedCall(mockPayload)).toEqual(action);
  });

  test('joinCall action', () => {
    const action = {
      type: LeadDetailActionTypes.JOIN_CALL,
    };
    expect(joinCall()).toEqual(action);
  });

  test('setTimer action', () => {
    const mockPayload = 0;
    const action = {
      type: LeadDetailActionTypes.CALL_TIMER,
      payload: mockPayload,
    };
    expect(setTimer(mockPayload)).toEqual(action);
  });

  test('failedCall action', () => {
    const mockPayload = 'error';
    const action = {
      type: LeadDetailActionTypes.FAILED_CALL,
      payload: mockPayload,
    };
    expect(failedCall(mockPayload)).toEqual(action);
  });

  test('endCall action', () => {
    const mockPayload = 'callname';
    const action = {
      type: LeadDetailActionTypes.END_CALL,
      payload: mockPayload,
    };
    expect(endCall(mockPayload)).toEqual(action);
  });
});
