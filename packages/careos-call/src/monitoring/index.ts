import RTCStatsAggregator from '../rtc-stats-aggregator';
import { CallStatus } from '../utils/status';

type Step =
  | 'PREPARING'
  | 'CREATING_RESOURCES'
  | 'SIGNALLING'
  | 'CONNECTING'
  | 'CALLING'
  | 'RECONNECTING';

type Outcome = 'INITIATED' | 'SUCCESS' | 'FAIL';

export default class Monitoring {
  nrAgent?: typeof newrelic | null;

  constructor() {
    if (typeof newrelic !== 'undefined') {
      this.nrAgent = newrelic;
    }
  }

  start() {
    this.nrAgent?.interaction().setName('Monitor Call');
  }

  stop() {
    this.nrAgent?.interaction().end();
    this.nrAgent?.interaction().save();
  }

  // Data for CallOutcome Chart
  logCallOutcome(outcome: Outcome) {
    this.nrAgent?.addPageAction?.('CALL_OUTCOME', { outcome });
  }

  // Data for CallFailReason Chart
  logFailStep(step: Step, message: string) {
    this.nrAgent?.addPageAction?.('CALL_FAIL_REASON', {
      step,
      message: message.toString(),
    });
  }

  // Data for StatusChange Chart
  logStatusChange(status: CallStatus) {
    this.nrAgent?.addPageAction?.('CALL_STATUS', { status });
  }

  // Data for reconnecting log
  logReconnectOutcome(outcome: Outcome) {
    this.nrAgent?.addPageAction?.('RECONNECT_OUTCOME', { outcome });
  }

  // Data for remote peer connection
  logRemotePeerConnection(status: string) {
    this.nrAgent?.addPageAction?.('REMOTE_PEER_CONNECTION', { status });
  }

  // Data for local peer connection
  logLocalPeerConnection(status: string) {
    this.nrAgent?.addPageAction?.('LOCAL_PEER_CONNECTION', { status });
  }

  // Data for rtc stats
  logRTCStats(descriptor: RTCStatsAggregator) {
    descriptor.onInboundRtpEmitted((e) => {
      this.nrAgent?.addPageAction?.('INBOUND_STATS', e);
    });
    descriptor.onOutboundRtpEmitted((e) => {
      this.nrAgent?.addPageAction?.('OUTBOUND_STATS', e);
    });
  }
}
