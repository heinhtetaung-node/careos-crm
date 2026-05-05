import { firstValueFrom, merge } from 'rxjs';
import { map, timeout } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';

import { SDPDescription } from '../api/types';
import { createPattern, subscribeEvent } from '../utils/ws-utils';

const TIMEOUT_SECOND = 5000;

interface SocketRequest {
  cmd: string;
  params: {
    pattern: string;
  };
  name?: string;
  body?: unknown;
}

export default class WebsocketNegotiator {
  websocket: WebSocketSubject<SocketRequest>;

  constructor(socket: WebSocketSubject<any>) {
    this.websocket = socket;
  }

  // sending offer via websocket is not implemented. We will resort to sending via rest client
  // eslint-disable-next-line class-methods-use-this
  async sendOffer(_callName: string, _offer: string) {
    throw Error('Not Implemented');
  }

  async startListeningForAnswer(callName: string) {
    const pattern = createPattern(callName, '/sdps/answer');
    const sub = merge(subscribeEvent(this.websocket, pattern)).pipe(
      map((res) => res.body as SDPDescription),
      timeout(TIMEOUT_SECOND)
    );
    return firstValueFrom(sub);
  }
}
