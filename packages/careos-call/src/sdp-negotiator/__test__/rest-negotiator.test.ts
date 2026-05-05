import Api from '../../api';
import RestNegotiator from '../rest-negotiator';

const api = new Api({
  baseApiUrl: 'baseUrl',
});
const mockOfferFn = jest.spyOn(api, 'putOffer');
const mockAnswerFn = jest.spyOn(api, 'getAnswer');

describe('rest negotiator', () => {
  beforeEach(() => {
    mockOfferFn.mockClear();
    mockAnswerFn.mockClear();
  });

  test('sending offer(success)', async () => {
    mockOfferFn.mockResolvedValue({ sdp: 'sdp', type: 'offer' });
    const negotiator = new RestNegotiator(api);
    const _ = await negotiator.sendOffer('callName', 'offer');
    expect(mockOfferFn).toBeCalledWith('callName', 'offer');
  });

  test('sending offer(failed api)', async () => {
    mockOfferFn.mockRejectedValue(new Error('failed'));
    const negotiator = new RestNegotiator(api);
    await expect(async () =>
      negotiator.sendOffer('callName_f', 'offer_f')
    ).rejects.toThrow();
    expect(mockOfferFn).toBeCalledWith('callName_f', 'offer_f');
  });

  test('sending offer(invalid sdp)', async () => {
    mockOfferFn.mockResolvedValue({ type: '', sdp: '' });
    const negotiator = new RestNegotiator(api);
    await expect(async () =>
      negotiator.sendOffer('callName_f', 'offer_f')
    ).rejects.toThrow();
    expect(mockOfferFn).toBeCalledWith('callName_f', 'offer_f');
  });

  test('listening for answer(success case)', async () => {
    mockAnswerFn.mockResolvedValue({ sdp: 'sdp', type: 'answer' });
    const negotiator = new RestNegotiator(api);
    const p = negotiator.startListeningForAnswer('callName');
    await expect(p).resolves.toStrictEqual({ sdp: 'sdp', type: 'answer' });
    expect(mockAnswerFn).toBeCalled();
  });

  test('listening for answer(unanswer followed by answer case)', async () => {
    mockAnswerFn
      .mockResolvedValueOnce({ sdp: '', type: '' })
      .mockResolvedValueOnce({ sdp: 'sdp', type: 'answer' });
    const negotiator = new RestNegotiator(api);
    const p = negotiator.startListeningForAnswer('callName');
    expect(mockAnswerFn).toBeCalled();
    await expect(p).resolves.toStrictEqual({ sdp: 'sdp', type: 'answer' });
    expect(mockAnswerFn).toBeCalledTimes(2);
  });

  test('listening for answer(unanswer case)', async () => {
    mockAnswerFn.mockResolvedValue({ sdp: '', type: '' });
    const negotiator = new RestNegotiator(api);
    const p = negotiator.startListeningForAnswer('callName');
    expect(mockAnswerFn).toBeCalled();
    await expect(p).rejects.toStrictEqual(
      Error('There is no sdp answer from the server')
    );
    expect(mockAnswerFn).toBeCalledTimes(4);
  }, 10000);
});
