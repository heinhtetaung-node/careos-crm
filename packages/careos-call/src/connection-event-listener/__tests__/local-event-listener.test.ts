import { ColdObservable } from 'rxjs/internal/testing/ColdObservable';
import { TestScheduler } from 'rxjs/testing';

import localPeerEventListener, {
  LocalEventMessage,
} from '../local-event-listener';

const getMockRTC = ($source: ColdObservable<any>) => ({
  addEventListener: (name: string, fn: (e: any) => void) => {
    $source.subscribe((ev) => fn({ target: { connectionState: ev } }));
  },
});

describe('local-event-listener', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) =>
      expect(actual).toStrictEqual(expected)
    );
  });

  it('should return all the status change events', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const sourceValues = {
        a: 'disconnected',
        b: 'connected',
        c: 'failed',
      };
      const source$ = cold('a-b-a-c', sourceValues);
      const mockRTC = getMockRTC(source$);

      const expectedValues = {
        a: { status: LocalEventMessage.Disconnected },
        b: { status: LocalEventMessage.Reconnected },
        c: { status: LocalEventMessage.ConnectionFailed },
      };
      const expected$ = cold('a-b-a-c', expectedValues);
      const result$ = localPeerEventListener(mockRTC as never);
      expectObservable(result$).toEqual(expected$);
    });
  });
});
