import { WebSocketSubject } from 'rxjs/webSocket';

export type CallParams = {
  agent: string;
  lead: string;
  phoneIndex: number;
};

export type Config = {
  callServiceUrl: string;
  websocket: WebSocketSubject<any>;
  shouldUseDefaultIceServers?: boolean;
};
