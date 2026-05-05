/* eslint-disable no-param-reassign */
import { Subscription, firstValueFrom, from, timeout } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';

import Api from './api';
import { SDPDescription } from './api/types';
import { iceConfiguration } from './config';
import localPeerEventListener, {
  LocalEventMessage,
} from './connection-event-listener/local-event-listener';
import remotePeerEventListener from './connection-event-listener/peer-event-listener';
import MediaController from './media';
import Monitoring from './monitoring';
import RTCStatsAggregator from './rtc-stats-aggregator';
import NegotiationManager from './sdp-negotiator';
import { CallParams, Config } from './types';
import { CallEnabledStatus, CallStatus } from './utils/status';

// Suggestions or any modification are open.

export const Status = CallStatus;

export default class CareOsCall {
  private apiClient: Api;

  private wsClient: WebSocketSubject<any>;

  private rtc: RTCPeerConnection | null = null;

  private rtcDescriptor: RTCStatsAggregator | null = null;

  private mediaController: MediaController;

  private _status: CallStatus;

  private currentCallName: string | null = null;

  private currentParticipantName: string | null = null;

  private currentRemoteListener: null | Subscription = null;

  private currentLocalListener: null | Subscription = null;

  private monitoring: Monitoring;

  private shouldUseDefaultIceServers: boolean;

  // eslint-disable-next-line class-methods-use-this
  onStatusChange: ((s: CallStatus) => void) | null = null;

  constructor(config: Config) {
    // improve this 3 dependencies using dependency inversion
    this.apiClient = new Api({
      baseApiUrl: config.callServiceUrl,
    });
    this.wsClient = config.websocket;

    this.mediaController = new MediaController();
    this._status = CallStatus.Disconnected;
    this.monitoring = new Monitoring();
    this.shouldUseDefaultIceServers =
      config.shouldUseDefaultIceServers ?? false;
  }

  private _changeStatus(status: CallStatus) {
    this.monitoring.logStatusChange(status);
    this.onStatusChange?.(status);
    this._status = status;
  }

  get status() {
    return this._status;
  }

  private async _prepare() {
    // prepare media resources for communication
    try {
      const iceServers = this.shouldUseDefaultIceServers
        ? iceConfiguration.iceServers
        : (await this.apiClient.getIceServers()).iceServers;

      this.rtc = new RTCPeerConnection({ iceServers });

      const stream = await this.mediaController.requestInputMedia();
      stream
        .getTracks()
        .forEach((track: MediaStreamTrack) => this.rtc?.addTransceiver(track));
    } catch (e) {
      this.monitoring.logFailStep('PREPARING', e as string);
      throw e;
    }
  }

  private async _registerCall(req: { agent: string }): Promise<{
    callName: string;
    participantName: string;
  }> {
    // create call resources to control the state of the call and participents
    try {
      const call = await this.apiClient.createCall();
      if (!call.name) {
        throw Error('Cannot create call');
      }
      const p = await this.apiClient.addAgentToCall({
        callName: call.name,
        agentName: req.agent,
      });
      if (!p.name) {
        throw Error('Cannot create participant');
      }
      return {
        callName: call.name,
        participantName: p.name,
      };
    } catch (e) {
      this.monitoring.logFailStep('CREATING_RESOURCES', e as string);
      throw e;
    }
  }

  private async _createOffer() {
    const offer = await this.rtc?.createOffer();
    await this.rtc?.setLocalDescription(offer);
  }

  private async _startSignalling(participantName: string, sdp: string) {
    // exchange sdp
    try {
      const sdpNegotiator = new NegotiationManager(
        this.apiClient,
        this.wsClient
      );
      const answer = await sdpNegotiator.start(participantName, sdp);
      return answer;
    } catch (e) {
      this.monitoring.logFailStep('SIGNALLING', e as string);
      throw e;
    }
  }

  private async _acceptAnswer(sdpDescription: SDPDescription) {
    // accept sdp answer and complete ice connection state
    try {
      this.rtc?.setRemoteDescription(
        new RTCSessionDescription({ type: 'answer', sdp: sdpDescription.sdp })
      );
      await firstValueFrom(
        from(
          new Promise<void>((resolve, reject) => {
            this.rtc!.onconnectionstatechange = (e: any) => {
              if (e.currentTarget.connectionState === 'connected') {
                resolve();
              }
              if (e.currentTarget.connectionState === 'failed') {
                reject(Error('ICE connection failed'));
              }
            };
          })
        ).pipe(timeout(3000))
      );
    } catch (e) {
      this.monitoring.logFailStep('CONNECTING', e as string);
      throw e;
    }
  }

  private async _callLead(params: {
    call: string;
    lead: string;
    phoneIndex: number;
  }) {
    try {
      const p = await this.apiClient.addLeadToCall({
        callName: params.call,
        leadName: params.lead,
        phoneIndex: params.phoneIndex,
      });
      if (!p.name) {
        throw Error('Cannot create participant');
      }
    } catch (e) {
      this.monitoring.logFailStep('CALLING', e as string);
      throw e;
    }
  }

  private _listenRemotePeerEvents() {
    this.currentRemoteListener = remotePeerEventListener({
      callName: this.currentCallName ?? '',
      ws: this.wsClient,
    }).subscribe((msg) => {
      this.monitoring.logRemotePeerConnection(msg.status);
      this._changeStatus(msg.status);
      if (
        msg.status === CallStatus.CallDeclined ||
        msg.status === CallStatus.Disconnected
      ) {
        this._cleanUpResources();
      }
    });
  }

  private _listenLocalPeerEvents() {
    if (this.rtc) {
      this.currentLocalListener = localPeerEventListener(this.rtc).subscribe(
        (msg) => {
          this.monitoring.logLocalPeerConnection(msg.status);
          if (
            msg.status === LocalEventMessage.Disconnected &&
            this.currentCallName
          ) {
            this._changeStatus(CallStatus.Disrupted);
          }
          if (
            msg.status === LocalEventMessage.Reconnected &&
            this.currentCallName
          ) {
            this._changeStatus(CallStatus.Joined);
          }
          if (
            msg.status === LocalEventMessage.ConnectionFailed &&
            this.currentCallName
          ) {
            this._changeStatus(CallStatus.Reconnecting);
            this._reconnect();
          }
        }
      );
    }
  }

  private _getRemoteAudioStreams() {
    return firstValueFrom(
      from(
        new Promise<MediaStream[]>((resolve, _reject) => {
          if (this.rtc!.getReceivers().length > 0) {
            resolve(
              this.rtc!.getReceivers().map((x) => new MediaStream([x.track]))
            );
          } else {
            this.rtc!.ontrack = (e) => resolve(e.streams as MediaStream[]);
          }
        })
      ).pipe(timeout(3000))
    );
  }

  private async _reconnect() {
    /* For disconnect due to unstable network, web rtc can automatically handle reconnection.
     * But for disconnect due to network change we need to initiate ice re-negotiation again.
     * This function aim to handle that case only.
     */
    if (this.rtc && this.currentCallName) {
      this.monitoring.logReconnectOutcome('INITIATED');
      try {
        // check the call is still going
        await this.apiClient.getParticipants(this.currentCallName);
        this.rtc.restartIce();
        await this._createOffer();
        const answer = await this._startSignalling(
          this.currentParticipantName ?? '',
          this.rtc.localDescription?.sdp ?? ''
        );
        await this._acceptAnswer(answer);
        this.monitoring.logReconnectOutcome('SUCCESS');
      } catch (e) {
        this.monitoring.logReconnectOutcome('FAIL');
        this.monitoring.logFailStep('RECONNECTING', e as string);
        this._changeStatus(CallStatus.Failed);
        this._cleanUpResources();
      }
    }
  }

  private async _cleanUpResources() {
    this.rtc?.close();
    this.rtc = null;
    this.mediaController.closeInputMedia();
    this.currentCallName = null;
    this.currentParticipantName = null;
    if (this.currentRemoteListener) {
      this.currentRemoteListener.unsubscribe();
      this.currentRemoteListener = null;
    }
    if (this.currentLocalListener) {
      this.currentLocalListener.unsubscribe();
      this.currentLocalListener = null;
    }
    if (this.rtcDescriptor) {
      this.rtcDescriptor.close();
      this.rtcDescriptor = null;
    }
    this.monitoring.stop();
  }

  // eslint-disable-next-line consistent-return
  public async initiateCall(params: CallParams) {
    if (CallEnabledStatus.includes(this._status)) {
      this.monitoring.logCallOutcome('INITIATED');
      try {
        // STEP: 1
        await this._prepare();

        // STEP: 2
        this._changeStatus(CallStatus.Signalling);
        await this._createOffer();
        const callResource = await this._registerCall({ agent: params.agent });
        this.currentCallName = callResource.callName;
        this.currentParticipantName = callResource.participantName;

        // STEP: 3
        const answer = await this._startSignalling(
          callResource.participantName,
          this.rtc?.localDescription?.sdp ?? ''
        );

        // STEP: 4
        this._changeStatus(CallStatus.Connecting);
        await this._acceptAnswer(answer);
        this._changeStatus(CallStatus.Connected);

        this._listenRemotePeerEvents();
        this._listenLocalPeerEvents();

        // STEP: 5
        await this._callLead({
          call: callResource.callName,
          lead: params.lead,
          phoneIndex: params.phoneIndex,
        });
        this.monitoring.logCallOutcome('SUCCESS');
        this.monitoring.logRTCStats(
          this.getRTCDescriptor() as RTCStatsAggregator
        );
        return this._getRemoteAudioStreams();
      } catch (e) {
        this._changeStatus(CallStatus.Failed);
        this.monitoring.logCallOutcome('FAIL');
        this._cleanUpResources();
        throw e;
      }
    }
  }

  public async hangUp() {
    this._changeStatus(CallStatus.Disconnected);
    try {
      if (this.currentCallName) {
        await this.apiClient.deleteCall(this.currentCallName);
      }
    } finally {
      await this._cleanUpResources();
    }
  }

  public getRTCDescriptor() {
    if (!this.rtcDescriptor && this.rtc) {
      this.rtcDescriptor = new RTCStatsAggregator(this.rtc);
    }
    return this.rtcDescriptor;
  }
}
