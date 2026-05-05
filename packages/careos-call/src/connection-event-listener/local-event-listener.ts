import { Observable, mergeMap, of, pairwise, startWith } from 'rxjs';

export enum LocalEventMessage {
  Disconnected = 'DISCONNECTED',
  ConnectionFailed = 'CONNECTION_DISRUPTED',
  Reconnected = 'RECONNECTED',
}

export default function localPeerEventListener(rtc: RTCPeerConnection) {
  return new Observable<RTCPeerConnectionState>((subscriber) => {
    rtc.addEventListener('connectionstatechange', (event: any) => {
      subscriber.next(event.target.connectionState);
    });
  }).pipe(
    startWith(undefined),
    pairwise(),
    mergeMap(([prev, current]) => {
      switch (current) {
        case 'failed':
          return of({
            status: LocalEventMessage.ConnectionFailed,
          }); /* This event was for the event when two peer are disconnected because of network connection and restiblishing connection failed. potentially network change. */
        case 'disconnected':
          return of({
            status: LocalEventMessage.Disconnected,
          }); /* This event got fire when two peer are disconnected due to various reason */
        case 'connected':
          return prev === 'disconnected'
            ? of({ status: LocalEventMessage.Reconnected })
            : of(); /* If rtc change it status to connected when its previous state is disconnected, that measn rtc connection is restiblished without any exter effort. */
        default:
          return of();
      }
    })
  );
}
