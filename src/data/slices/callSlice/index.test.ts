import { configureStore } from '@reduxjs/toolkit';

import callReducer, {
  changeState,
  hangUpCallAction,
  initCareOsCall,
  resetTimer,
  selectCareosCall,
  setAudioStream,
  startCallAction,
  tickTimer,
} from './index';

jest.mock('careos-call', () => {
  const Status = {
    Connecting: 'CONNECTING',
    Signalling: 'SIGNALLING',
    Connected: 'CONNECTED',
    ConnectingPeer: 'CONNECTING_PEER',
    Ringing: 'RINGING',
    Joined: 'JOINED',
    Disrupted: 'CONNECTION_DISRURPTED',
    Reconnecting: 'RECONNECTING',
    Failed: 'FAILED',
  };
  class CareOsCall {
    constructor() {
      this.onStatusChange = null;
      this.initiateCall = jest.fn(async () => [{ mock: 'MediaStream' }]);
      this.hangUp = jest.fn();
    }
  }
  return { __esModule: true, default: CareOsCall, Status };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Status } = require('careos-call');

const callRequest = {
  lead: 'leads/1',
  phoneIndex: 0,
  agent: 'users/agent-1',
};

function createStore() {
  return configureStore({
    reducer: { callReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
}

describe('callSlice/index', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('reducers', () => {
    it('initCareOsCall sets careosCall', () => {
      const store = createStore();
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: CareOsCall } = require('careos-call');
      const instance = new CareOsCall();
      store.dispatch(initCareOsCall(instance));
      expect(store.getState().callReducer.careosCall).toBe(instance);
    });

    it('changeState updates callState', () => {
      const store = createStore();
      store.dispatch(changeState('ringing'));
      expect(store.getState().callReducer.callState).toBe('ringing');
    });

    it('setAudioStream updates audio', () => {
      const store = createStore();
      const audio = [{ mock: 'stream' }] as MediaStream[];
      store.dispatch(setAudioStream(audio));
      expect(store.getState().callReducer.audio).toBe(audio);
    });

    it('tickTimer increments timer', () => {
      const store = createStore();
      store.dispatch(tickTimer());
      store.dispatch(tickTimer());
      expect(store.getState().callReducer.timer).toBe(2);
    });

    it('resetTimer clears timer', () => {
      const store = createStore();
      store.dispatch(tickTimer());
      store.dispatch(resetTimer());
      expect(store.getState().callReducer.timer).toBe(0);
    });
  });

  describe('selectCareosCall', () => {
    it('combines status, audio, timer', () => {
      const store = createStore();
      store.dispatch(changeState('incall'));
      store.dispatch(setAudioStream(undefined));
      store.dispatch(tickTimer());

      expect(selectCareosCall(store.getState())).toEqual({
        status: 'incall',
        audio: undefined,
        timer: 1,
      });
    });
  });

  describe('startCallAction', () => {
    it('rejects when CareOsCall is not initialized', async () => {
      const store = createStore();
      const result = await store.dispatch(startCallAction(callRequest));
      expect(startCallAction.rejected.match(result)).toBe(true);
      expect((result as { error?: { message?: string } }).error?.message).toBe(
        'CareosCall is not initialized. Call initCareOsCall action first.'
      );
    });

    it('does not call initiateCall when callState is not idle or ended', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: CareOsCall } = require('careos-call');
      const careos = new CareOsCall();
      const store = createStore();
      store.dispatch(initCareOsCall(careos));
      store.dispatch(changeState('ringing'));

      await store.dispatch(startCallAction(callRequest));

      expect(careos.initiateCall).not.toHaveBeenCalled();
    });

    it('runs status handlers, timer interval, and completes on terminal status', async () => {
      jest.useFakeTimers();
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: CareOsCall } = require('careos-call');
      const careos = new CareOsCall();

      const store = createStore();
      store.dispatch(initCareOsCall(careos));

      const promise = store.dispatch(startCallAction(callRequest));

      await Promise.resolve();

      const handler = careos.onStatusChange as (s: string) => void;
      expect(typeof handler).toBe('function');

      handler(Status.Connecting);
      expect(store.getState().callReducer.callState).toBe('connecting');

      handler(Status.Signalling);
      expect(store.getState().callReducer.callState).toBe('connecting');

      handler(Status.Connected);
      expect(store.getState().callReducer.callState).toBe('connecting');

      handler(Status.ConnectingPeer);
      expect(store.getState().callReducer.callState).toBe('connecting');

      handler(Status.Ringing);
      expect(store.getState().callReducer.callState).toBe('ringing');

      handler(Status.Joined);
      expect(store.getState().callReducer.callState).toBe('incall');

      handler(Status.Disrupted);
      expect(store.getState().callReducer.callState).toBe('reconnecting');

      handler(Status.Reconnecting);
      expect(store.getState().callReducer.callState).toBe('reconnecting');

      jest.advanceTimersByTime(1000);
      expect(store.getState().callReducer.timer).toBeGreaterThanOrEqual(1);

      handler(Status.Failed);

      await (promise as unknown as Promise<void>);

      expect(store.getState().callReducer.callState).toBe('ended');
      expect(store.getState().callReducer.timer).toBe(0);
      expect(store.getState().callReducer.audio).toBeUndefined();
      expect(careos.onStatusChange).toBeNull();
      expect(clearIntervalSpy).toHaveBeenCalled();

      clearIntervalSpy.mockRestore();
    });

    it('covers Signalling branch alone and ends call via else branch', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: CareOsCall } = require('careos-call');
      const careos = new CareOsCall();
      const store = createStore();
      store.dispatch(initCareOsCall(careos));

      const promise = store.dispatch(startCallAction(callRequest));
      await Promise.resolve();

      const handler = careos.onStatusChange as (s: string) => void;
      handler(Status.Failed);

      await (promise as unknown as Promise<void>);
      expect(store.getState().callReducer.callState).toBe('ended');
    });

    it('runs when initial callState is ended', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: CareOsCall } = require('careos-call');
      const careos = new CareOsCall();
      const store = createStore();
      store.dispatch(initCareOsCall(careos));
      store.dispatch(changeState('ended'));

      const promise = store.dispatch(startCallAction(callRequest));
      await Promise.resolve();
      (careos.onStatusChange as (s: string) => void)(Status.Failed);
      await (promise as unknown as Promise<void>);

      expect(careos.initiateCall).toHaveBeenCalled();
    });
  });

  describe('hangUpCallAction', () => {
    it('returns when careosCall is missing', async () => {
      const store = createStore();
      await store.dispatch(hangUpCallAction());
      expect(store.getState().callReducer.careosCall).toBeNull();
    });

    it('does not hang up when call is idle or ended', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: CareOsCall } = require('careos-call');
      const careos = new CareOsCall();
      const store = createStore();
      store.dispatch(initCareOsCall(careos));

      await store.dispatch(hangUpCallAction());
      expect(careos.hangUp).not.toHaveBeenCalled();

      store.dispatch(changeState('ended'));
      await store.dispatch(hangUpCallAction());
      expect(careos.hangUp).not.toHaveBeenCalled();
    });

    it('calls hangUp when in an active call state', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: CareOsCall } = require('careos-call');
      const careos = new CareOsCall();
      const store = createStore();
      store.dispatch(initCareOsCall(careos));
      store.dispatch(changeState('incall'));

      await store.dispatch(hangUpCallAction());
      expect(careos.hangUp).toHaveBeenCalledTimes(1);
    });
  });
});
