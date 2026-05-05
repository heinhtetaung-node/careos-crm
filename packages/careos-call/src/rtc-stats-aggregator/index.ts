import {
  Observable,
  Subscription,
  from,
  interval,
  mergeMap,
  of,
  switchMap,
} from 'rxjs';

import {
  InboundRTCStats,
  OutboundRTCStats,
  getInboundRTCStats,
  getOutboundRTCStats,
} from './utils';

const DEFAULT_SAMPLING_RATE = 1;

type Options = {
  samplingRate?: number /* sample per second for reporting rtc stats */;
};
export default class RTCStatsAggregator {
  eventGenerator: Observable<RTCStatsReport>;

  subscriptions: Subscription[] = [];

  constructor(rtc: RTCPeerConnection, options?: Options) {
    const samplingRate = options?.samplingRate ?? DEFAULT_SAMPLING_RATE;
    this.eventGenerator = interval(Math.floor(1000 / samplingRate)).pipe(
      switchMap(() => from(rtc.getStats()))
    );
  }

  get _inboundRTCStatsStream() {
    return this.eventGenerator.pipe(
      mergeMap((x) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const report of x.values()) {
          if (report.type === 'inbound-rtp') {
            return of(getInboundRTCStats(report));
          }
        }
        return of();
      })
    );
  }

  get _outboundRTCStatsStream() {
    return this.eventGenerator.pipe(
      mergeMap((x) => {
        // eslint-disable-next-line no-restricted-syntax
        for (const report of x.values()) {
          if (report.type === 'outbound-rtp') {
            return of(getOutboundRTCStats(report));
          }
        }
        return of();
      })
    );
  }

  onInboundRtpEmitted(fn: (stat: InboundRTCStats) => void) {
    this.subscriptions.push(
      this._inboundRTCStatsStream.subscribe((e) => fn(e))
    );
  }

  onOutboundRtpEmitted(fn: (stat: OutboundRTCStats) => void) {
    this.subscriptions.push(
      this._outboundRTCStatsStream.subscribe((e) => fn(e))
    );
  }

  close() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
