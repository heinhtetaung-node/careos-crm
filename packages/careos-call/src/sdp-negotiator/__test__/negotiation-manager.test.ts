import NegotiationManager from '..';
import RestNegotiator from '../rest-negotiator';
import WebsocketNegotiator from '../websocket-negotiator';

const offerFn = jest
  .spyOn(RestNegotiator.prototype, 'sendOffer')
  .mockResolvedValue();
const wsAnsFn = jest
  .spyOn(WebsocketNegotiator.prototype, 'startListeningForAnswer')
  .mockRejectedValue('');
const restAnsFn = jest
  .spyOn(RestNegotiator.prototype, 'startListeningForAnswer')
  .mockResolvedValue({ sdp: 'sdp', type: 'answer' });

describe('negotiationManager', () => {
  test('should fallback to rest negotiator if ws reject', async () => {
    const n = new NegotiationManager({} as any, {} as any);
    const r = n.start('callName', 'sdp');
    await expect(r).resolves.toEqual({ sdp: 'sdp', type: 'answer' });
    expect(offerFn).toBeCalledWith('callName', 'sdp');
    expect(wsAnsFn).toBeCalledWith('callName');
    expect(restAnsFn).toBeCalledWith('callName');
  });
});
