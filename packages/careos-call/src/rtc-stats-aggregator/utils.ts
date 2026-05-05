export type InboundRTCStats = {
  packetsLost: number;
  jitter: number;
  nackCount: number;
  audioLevel: number;
};

export type OutboundRTCStats = {
  nackCount: number;
};

export const getInboundRTCStats = (
  stats: RTCInboundRtpStreamStats
): InboundRTCStats => ({
  packetsLost: stats.packetsLost ?? 0,
  jitter: stats.jitter ?? 0,
  nackCount: stats.nackCount ?? 0,
  audioLevel: stats.audioLevel ?? 0,
});

export const getOutboundRTCStats = (
  stats: RTCOutboundRtpStreamStats
): OutboundRTCStats => ({
  nackCount: stats.nackCount ?? 0,
});
