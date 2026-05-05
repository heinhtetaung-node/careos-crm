import { WebSocketSubject } from 'rxjs/webSocket';

import RestNegotiator from './rest-negotiator';
import WebsocketNegotiator from './websocket-negotiator';

import Api from '../api';

export default class NegotiationManager {
  // default negotiator
  wsNegotiator: WebsocketNegotiator;

  restNegotiator: RestNegotiator;

  constructor(api: Api, websocket: WebSocketSubject<any>) {
    this.wsNegotiator = new WebsocketNegotiator(websocket);
    this.restNegotiator = new RestNegotiator(api);
  }

  async start(
    callName: string,
    offer: string
  ): Promise<{ type: string; sdp: string }> {
    this.restNegotiator.sendOffer(callName, offer);
    try {
      return await this.wsNegotiator.startListeningForAnswer(callName);
    } catch (e) {
      console.log('Cannot get answer from Ws. Fall back to restNegotiator');
      return this.restNegotiator.startListeningForAnswer(callName);
    }
  }
}
