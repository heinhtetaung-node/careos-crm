import { Subscription } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';

import { CallStatus } from './status';

import CareOsCall from '..';
import Api from '../api';
import { SDPDescription } from '../api/types';
import MediaController from '../media';
import RTCStatsAggregator from '../rtc-stats-aggregator';
import { CallParams } from '../types';

// eslint-disable-next-line import/prefer-default-export
export const mockFetch = (value: any, status?: number) =>
  jest
    .spyOn(global, 'fetch')
    .mockResolvedValue(
      new Response(
        new Blob([JSON.stringify(value)]),
        status ? { status } : undefined
      )
    );

export type MockCallType = {
  apiClient: Api;

  wsClient: WebSocketSubject<any>;

  rtc: RTCPeerConnection | null;

  rtcDescriptor: RTCStatsAggregator | null;

  mediaController: MediaController;

  _status: CallStatus;

  currentCallName: string | null;

  currentParticipantName: string | null;

  currentRemoteListener: null | Subscription;

  currentLocalListener: null | Subscription;

  onStatusChange: ((s: CallStatus) => void) | null;

  _changeStatus: (status: CallStatus) => void;

  _prepare: () => Promise<void>;

  _registerCall: (req: { agent: string }) => Promise<{
    callName: string;
    participantName: string;
  }>;

  _createOffer: () => Promise<void>;

  _startSignalling: (
    participantName: string,
    sdp: string
  ) => Promise<{ sdp: string; type: string }>;

  _acceptAnswer: (sdpDescription: SDPDescription) => Promise<void>;

  _callLead: (params: {
    call: string;
    lead: string;
    phoneIndex: number;
  }) => Promise<void>;

  _listenRemotePeerEvents: () => void;

  _listenLocalPeerEvents: () => void;

  _cleanUpResources: () => Promise<void>;

  _getRemoteAudioStreams: () => Promise<MediaStream[]>;

  _reconnect: () => Promise<void>;

  initiateCall: (params: CallParams) => Promise<void>;

  hangUp: () => Promise<void>;

  etRTCDescriptor: () => RTCStatsAggregator | null;
};

export const getMockCall = (mockRTC: any) => {
  const call = new CareOsCall({
    callServiceUrl: 'callService',
    websocket: 'ws' as any,
    shouldUseDefaultIceServers: true,
  }) as unknown as MockCallType;
  call.rtc = mockRTC as any;
  return call;
};
