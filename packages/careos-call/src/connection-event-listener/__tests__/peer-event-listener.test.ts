import { TestScheduler } from 'rxjs/testing';

import { CallStatus } from '../../utils/status';
import * as Utils from '../../utils/ws-utils';
import remotePeerEventListener from '../peer-event-listener';

describe('peer-event-listener', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) =>
      expect(actual).toStrictEqual(expected)
    );
  });

  it('should return all the status change events', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const sourceValues = {
        a: { body: { state: 'CONNECTING' } },
        b: { body: { state: 'RINGING' } },
        c: { body: { state: 'JOINED' } },
        d: { body: { state: 'JOINED', deleteTime: '12-12-12' } },
      };
      const source$ = cold('a-b-c-d|', sourceValues);
      jest.spyOn(Utils, 'subscribeEvent').mockReturnValue(source$);

      const expectedValues = {
        a: { status: CallStatus.ConnectingPeer },
        b: { status: CallStatus.Ringing },
        c: { status: CallStatus.Joined },
        d: { status: CallStatus.Disconnected },
      };
      const expected$ = cold('a-b-c-d|', expectedValues);
      const result$ = remotePeerEventListener({} as any);
      expectObservable(result$).toEqual(expected$);
    });
  });

  it('should correctly detect hangup', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const sourceValues = {
        a: { body: { state: 'RINGING' } },
        b: { body: { state: 'RINGING', deleteTime: '12-12-12' } },
      };
      const source$ = cold('a-b|', sourceValues);
      jest.spyOn(Utils, 'subscribeEvent').mockReturnValue(source$);

      const expectedValues = {
        a: { status: CallStatus.Ringing },
        b: { status: CallStatus.CallDeclined },
      };
      const expected$ = cold('a-b|', expectedValues);
      const result$ = remotePeerEventListener({} as any);
      expectObservable(result$).toEqual(expected$);
    });
  });
});
