import { EMPTY, interval, Observable, Subject, Subscription } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export interface SocketRequest {
  cmd: string;
  params: {
    pattern: string;
  };
  name?: string;
  body?: unknown;
}

const defaultSubscribeOptions = {
  emitUnsubscribe: false,
  strictFiltering: false,
};

export const endpoint = process.env.VITE_SOCKET_ENDPOINT || '';

export function getParams(cmd: string, pattern: string): SocketRequest {
  return {
    cmd,
    params: {
      pattern,
    },
  };
}

export default class WebSocketGateway {
  private static instance: WebSocketGateway | undefined;

  private subject: WebSocketSubject<SocketRequest> | null = null;

  private closeSubject: Subject<CloseEvent>;

  private keepAliveSubscription: Subscription | null;

  private constructor() {
    this.keepAliveSubscription = interval(10000).subscribe(() =>
      this.subscribe('')
    );
    this.closeSubject = new Subject<CloseEvent>();
    this.closeSubject.subscribe(() => {
      console.log('Underlying WebSocket connection closed');
      this.keepAliveSubscription?.unsubscribe();
      this.keepAliveSubscription = null;
    });
    this.subject = webSocket<SocketRequest>({
      url: endpoint,
      closeObserver: this.closeSubject,
      openObserver: {
        next: () => console.log('Underlying WebSocket connection open'),
      },
    });
  }

  getWs() {
    return this.subject;
  }

  public static getInstance(): WebSocketGateway {
    if (!WebSocketGateway.instance) {
      WebSocketGateway.instance = new WebSocketGateway();
    }

    return WebSocketGateway.instance;
  }

  subscribe(
    pattern: string,
    options?: Partial<typeof defaultSubscribeOptions>
  ): Observable<SocketRequest> | undefined {
    const { emitUnsubscribe, strictFiltering } = {
      ...defaultSubscribeOptions,
      ...options,
    };
    return this.subject
      ?.multiplex(
        () => getParams('sub', pattern),
        () => (emitUnsubscribe ? getParams('unsub', pattern) : {}),
        (message) =>
          strictFiltering
            ? pattern === message.name
            : new RegExp(pattern).test(message.name ?? '')
      )
      .pipe(
        retry({ count: 3, delay: 1000 }),
        catchError((error) => {
          // Avoid unhandled CloseEvent errors from websocket disconnects
          console.warn('WebSocket subscription error', error);
          return EMPTY;
        })
      );
  }

  unsubscribe(pattern: string) {
    const params = getParams('unsub', pattern);
    this.subject?.next(params);
  }

  close() {
    this.subject?.unsubscribe();
    WebSocketGateway.instance = undefined;
  }
}
