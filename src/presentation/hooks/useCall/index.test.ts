import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook, waitFor } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { LeadDetailGetLeadActionTypes } from 'presentation/redux/actions/leadDetail/getLeadByName';
import {
  LeadDetailActionTypes,
} from 'presentation/redux/actions/leads/detail';
import { persistedReducer } from 'presentation/redux/store';
import { CallStatus } from 'presentation/redux/reducers/leadDetail/call';

import useCall from '.';

jest.mock('presentation/pages/car-insurance/LeadDetailsPage/WebRTC', () => ({
  closePeerConnection: jest.fn(),
  getPeerConnection: jest.fn(() => ({ mockPeer: true })),
  startPeerConnection: jest.fn(() => Promise.resolve()),
}));

type WebRtcModuleMock = {
  closePeerConnection: jest.Mock;
  getPeerConnection: jest.Mock;
  startPeerConnection: jest.Mock;
};

const mockWebRTC = jest.requireMock(
  'presentation/pages/car-insurance/LeadDetailsPage/WebRTC'
) as unknown as WebRtcModuleMock;

const mockStream = { id: 'mock-media-stream' } as MediaStream;

function buildInitialState(callDataOverrides: Record<string, unknown> = {}) {
  return {
    leadsDetailReducer: {
      callReducer: {
        isFetching: false,
        success: true,
        status: '',
        actionType: '',
        data: {
          loading: false,
          callStatus: CallStatus.Idle,
          callName: 'calls/test-call',
          timer: 0,
          sdpAnswer: {},
          sdpAnswerResource: '',
          audioStream: null,
          hasShowedSummary: false,
          ...callDataOverrides,
        },
      },
    },
  };
}

function createStoreWithSpy(callDataOverrides?: Record<string, unknown>) {
  const store = configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat([apiSlice.middleware]) as any,
    reducer: persistedReducer,
    preloadedState: buildInitialState(callDataOverrides) as any,
  });
  const dispatchSpy = jest.spyOn(store, 'dispatch');
  return { store, dispatchSpy };
}

describe('useCall', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWebRTC.startPeerConnection.mockImplementation(() => Promise.resolve());
  });

  it('returns callStatus derived from leadsDetail callReducer', () => {
    const { result } = renderHook(
      () => useCall(),
      {
        initialState: buildInitialState({ callStatus: CallStatus.Join }),
      }
    ) as { result: { current: ReturnType<typeof useCall> } };
    expect(result.current.callStatus).toBe(CallStatus.Join);
  });

  it('cancelCall dispatches endCall and closes the peer connection', () => {
    const { result, store } = renderHook(() => useCall(), {
      initialState: buildInitialState(),
    }) as {
      result: { current: ReturnType<typeof useCall> };
      store: { getState: () => { leadsDetailReducer: { callReducer: { data: { callStatus: CallStatus } } } } };
    };

    act(() => {
      result.current.cancelCall();
    });

    expect(mockWebRTC.closePeerConnection).toHaveBeenCalledTimes(1);
    expect(
      store.getState().leadsDetailReducer.callReducer.data.callStatus
    ).toBe(CallStatus.End);
  });

  it('startUpCall invokes WebRTC then dispatches calling with peer connection', async () => {
    const { result, store } = renderHook(() => useCall(), {
      initialState: buildInitialState(),
    }) as {
      result: { current: ReturnType<typeof useCall> };
      store: { getState: () => { leadsDetailReducer: { callReducer: { data: { callStatus: CallStatus } } } } };
    };

    await act(async () => {
      result.current.startUpCall(1);
    });

    await waitFor(() => {
      expect(
        store.getState().leadsDetailReducer.callReducer.data.callStatus
      ).toBe(CallStatus.Calling);
    });

    expect(mockWebRTC.startPeerConnection).toHaveBeenCalledTimes(1);
    expect(mockWebRTC.getPeerConnection).toHaveBeenCalled();
    expect(mockWebRTC.startPeerConnection).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('dispatches setCallAudioStream with the first stream when the peer emits tracks', async () => {
    const secondStream = { id: 'second' } as MediaStream;
    mockWebRTC.startPeerConnection.mockImplementation(
      (onTrack: (e: { streams: readonly MediaStream[] }) => void) => {
        onTrack({ streams: [mockStream, secondStream] });
        return Promise.resolve();
      }
    );

    const { result, store } = renderHook(() => useCall(), {
      initialState: buildInitialState(),
    }) as {
      result: { current: ReturnType<typeof useCall> };
      store: { getState: () => { leadsDetailReducer: { callReducer: { data: { audioStream: MediaStream | null } } } } };
    };

    await act(async () => {
      result.current.startUpCall(0);
    });

    await waitFor(() => {
      expect(
        store.getState().leadsDetailReducer.callReducer.data.audioStream
      ).toBe(mockStream);
    });
  });

  it('when leadName is set, subscribes to lead updates, loads lead, and fetches call participants', async () => {
    const leadName = 'leads/7d4485a2-e44d-437c-8cd9-b74df8080ae9';
    const { store, dispatchSpy } = createStoreWithSpy();

    renderHook(() => useCall(leadName), {
      _store: store,
    });

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: LeadDetailActionTypes.SUBSCRIBE_LEAD_UPDATES,
          payload: { leadName: '7d4485a2-e44d-437c-8cd9-b74df8080ae9' },
        })
      );
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LeadDetailGetLeadActionTypes.GET_LEAD,
        payload: { leadId: '7d4485a2-e44d-437c-8cd9-b74df8080ae9' },
      })
    );

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: LeadDetailActionTypes.GET_CALL_PARTICIPANTS,
        payload: {
          pageSize: 1,
          filter: `destination.lead.lead="${leadName}"`,
        },
      })
    );

    dispatchSpy.mockRestore();
  });

  it('does not dispatch lead subscription effects when leadName is undefined', () => {
    const { store, dispatchSpy } = createStoreWithSpy();

    renderHook(() => useCall(undefined), {
      _store: store,
    });

    const subscribeCalls = dispatchSpy.mock.calls.filter(
      ([action]) =>
        (action as { type?: string }).type ===
        LeadDetailActionTypes.SUBSCRIBE_LEAD_UPDATES
    );

    expect(subscribeCalls).toHaveLength(0);
    dispatchSpy.mockRestore();
  });

});
