import { Observable, map, merge, pairwise, startWith } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';

import { CallStatus, PeerConnectionState } from '../utils/status';
import { createPattern, subscribeEvent } from '../utils/ws-utils';

type PeerEventListenerParams = {
  callName: string;
  ws: WebSocketSubject<any>;
};

type PeerEventMessage = {
  status: CallStatus;
};

export default function remotePeerEventListener({
  callName,
  ws,
}: PeerEventListenerParams) {
  const pattern = createPattern(callName, '/participants/*');
  const peerEvent = subscribeEvent(ws, pattern);
  return merge(peerEvent).pipe(
    startWith(undefined),
    pairwise(),
    map(([prev, current]) => {
      // call was deleted in the ringing state(call declined)
      if (current?.body?.deleteTime && prev?.body?.state === 'RINGING') {
        return { status: CallStatus.CallDeclined };
      }
      // call was deleted in the join state(hangup by peer)
      if (current?.body?.deleteTime && prev?.body?.state === 'JOINED') {
        return { status: CallStatus.Disconnected };
      }
      switch (current?.body?.state as PeerConnectionState) {
        case 'CONNECTING':
          return { status: CallStatus.ConnectingPeer };
        case 'RINGING':
          return { status: CallStatus.Ringing };
        case 'JOINED':
          return { status: CallStatus.Joined };
        default:
          return { status: CallStatus.Failed };
      }
    })
  ) as Observable<PeerEventMessage>;
}
