import {
  createAsyncThunk,
  createSelector,
  createSlice,
} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import CareOsCall, { Status } from 'careos-call';

import { RootState } from 'presentation/redux/reducers';

type CallState =
  | 'idle'
  | 'connecting'
  | 'ringing'
  | 'incall'
  | 'ended'
  | 'reconnecting';

type CallRequest = {
  lead: string;
  phoneIndex: number;
  agent: string;
};

const initialState = {
  careosCall: null as CareOsCall | null,
  callState: 'idle' as CallState,
  audio: undefined as MediaStream[] | undefined,
  timer: 0,
};

const callSlice = createSlice({
  name: 'careosCall',
  initialState,
  reducers: {
    initCareOsCall(state, action: PayloadAction<CareOsCall>) {
      state.careosCall = action.payload;
      return state;
    },
    changeState(state, action: PayloadAction<CallState>) {
      state.callState = action.payload;
      return state;
    },
    setAudioStream(state, action: PayloadAction<MediaStream[] | undefined>) {
      state.audio = action.payload;
      return state;
    },
    tickTimer(state) {
      state.timer += 1;
      return state;
    },
    resetTimer(state) {
      state.timer = 0;
      return state;
    },
  },
});

export const {
  initCareOsCall,
  changeState,
  setAudioStream,
  tickTimer,
  resetTimer,
} = callSlice.actions;

export const startCallAction: any = createAsyncThunk(
  'careosCall/start',
  async (callRequest: CallRequest, { getState, dispatch }) => {
    const store = getState() as RootState;
    const { careosCall, callState } = store.callReducer;
    if (!careosCall) {
      throw new Error(
        'CareosCall is not initialized. Call initCareOsCall action first.'
      );
    }
    if (callState === 'ended' || callState === 'idle') {
      let timeoutHandler: ReturnType<typeof setInterval> | undefined;
      const p = new Promise<void>((res, _) => {
        careosCall.onStatusChange = (s: any) => {
          if (
            [
              Status.Connecting,
              Status.Signalling,
              Status.Connected,
              Status.ConnectingPeer,
            ].includes(s)
          ) {
            dispatch(callSlice.actions.changeState('connecting'));
          } else if (s === Status.Ringing) {
            dispatch(callSlice.actions.changeState('ringing'));
          } else if (s === Status.Joined) {
            dispatch(callSlice.actions.changeState('incall'));
            timeoutHandler = setInterval(
              () => dispatch(callSlice.actions.tickTimer()),
              1000
            );
          } else if ([Status.Disrupted, Status.Reconnecting].includes(s)) {
            dispatch(callSlice.actions.changeState('reconnecting'));
          } else {
            dispatch(callSlice.actions.changeState('ended'));
            dispatch(callSlice.actions.setAudioStream());
            dispatch(callSlice.actions.resetTimer());
            careosCall.onStatusChange = null;
            res();
          }
        };
        careosCall
          .initiateCall(callRequest)
          .then((stream: any) =>
            dispatch(callSlice.actions.setAudioStream(stream))
          );
      });
      await p;
      clearInterval(timeoutHandler);
    }
  }
);
export const hangUpCallAction: any = createAsyncThunk(
  'careosCall/hangup',
  async (_, { getState }) => {
    const store = getState() as RootState;
    const { careosCall, callState } = store.callReducer;

    // Check if careosCall is initialized
    if (!careosCall) {
      return;
    }

    if (callState !== 'ended' && callState !== 'idle') {
      careosCall.hangUp();
    }
  }
);
const status = (state: RootState) => state.callReducer.callState;
const audio = (state: RootState) => state.callReducer.audio;
const timer = (state: RootState) => state.callReducer.timer;
export const selectCareosCall = createSelector(
  [status, audio, timer],
  (_status, _audio, _timer) => ({
    status: _status,
    audio: _audio,
    timer: _timer,
  })
);
export default callSlice.reducer;
