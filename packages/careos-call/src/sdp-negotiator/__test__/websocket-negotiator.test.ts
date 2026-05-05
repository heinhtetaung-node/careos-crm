import { Subject } from 'rxjs';

import WebsocketNegotiator from '../websocket-negotiator';

describe('rest negotiator', () => {
  test('listening for answer(success case)', async () => {
    const subject = new Subject();
    const negotiator = new WebsocketNegotiator({
      multiplex: () => subject,
    } as any);
    const p = negotiator.startListeningForAnswer('callName');
    subject.next({ body: { sdp: 'sdp', type: 'answer' } });
    await expect(p).resolves.toStrictEqual({ sdp: 'sdp', type: 'answer' });
  });

  test('listening for answer(unanswer)', async () => {
    const subject = new Subject();
    const negotiator = new WebsocketNegotiator({
      multiplex: () => subject,
    } as any);
    const p = negotiator.startListeningForAnswer('callName');
    await expect(p).rejects.toBeTruthy();
  }, 7000);
});
