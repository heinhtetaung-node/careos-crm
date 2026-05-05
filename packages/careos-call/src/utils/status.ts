export enum CallStatus {
  Disconnected = 'DISCONNECTED',
  Signalling = 'SIGNALLING',
  Connecting = 'CONNECTING',
  Connected = 'CONNECTED',
  ConnectingPeer = 'CONNECTING_PEER',
  Ringing = 'RINGING',
  Joined = 'JOINED',
  CallDeclined = 'CALL_DECLINED',
  Disrupted = 'CONNECTION_DISRURPTED',
  Reconnecting = 'RECONNECTING',
  Failed = 'FAILED',
}

export const CallEnabledStatus = [
  CallStatus.Disconnected,
  CallStatus.Failed,
  CallStatus.CallDeclined,
];

export const PEER_CONNECTION_STATE = [
  'CONNECTING',
  'RINGING',
  'JOINED',
] as const;

export type PeerConnectionState = (typeof PEER_CONNECTION_STATE)[number];
