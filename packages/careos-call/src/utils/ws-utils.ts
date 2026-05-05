import { EMPTY } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';

export function createPattern(base: string, suffix: string = ''): string {
  return `call/v1alpha1/${base}${suffix}`;
}

export function subscribeEvent(ws: WebSocketSubject<any>, pattern: string) {
  return ws
    .multiplex(
      () => ({
        cmd: 'sub',
        params: { pattern },
      }),
      () => ({
        cmd: 'unsub',
        params: { pattern },
      }),
      (message) => new RegExp(pattern).test(message.name ?? '')
    )
    .pipe(
      retry({ count: 3, delay: 1000 }),
      catchError((error) => {
        // Prevent unhandled CloseEvent bubbling to the UI
        console.warn('WebSocket event stream error', error);
        return EMPTY;
      })
    );
}
