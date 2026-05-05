import * as Operator from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

import RTCStatsAggregator from '../index';

const mockRTC = {
  getStats: jest.fn().mockReturnValue({
    values: jest.fn().mockReturnValue([
      {
        type: 'inbound-rtp',
        packetsLost: 1,
        jitter: 1,
        nackCount: 1,
        audioLevel: 1,
        totalBytesReceived: 1,
        totalPackagesReceived: 1,
      },
      {
        type: 'outbound-rtp',
        packetsLost: 1,
        jitter: 1,
        nackCount: 1,
        audioLevel: 1,
        totalBytesReceived: 1,
        totalPackagesReceived: 1,
      },
    ]),
  }),
};

const mockInterval = jest.spyOn(Operator, 'interval');
// hack for marble testing function with switchMap and from
jest.spyOn(Operator, 'from').mockImplementation(Operator.of);

describe('RTCStatsAggregator', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    mockInterval.mockClear();
    scheduler = new TestScheduler((actual, expected) =>
      expect(actual).toStrictEqual(expected)
    );
  });

  it('should be able to specify the sampling rate for rtc stats collection', () => {
    const _ = new RTCStatsAggregator(mockRTC as never, {
      samplingRate: 5,
    });
    expect(mockInterval).toBeCalledWith(200);
  });

  it('should report inbound rtp stats', () => {
    scheduler.run(({ expectObservable, cold }) => {
      const $source = cold('a 10ms a 10ms a', { a: 1 });
      mockInterval.mockReturnValue($source);
      const aggergator = new RTCStatsAggregator(mockRTC as never);
      const $expect = cold('a 10ms a 10ms a', {
        a: { packetsLost: 1, jitter: 1, nackCount: 1, audioLevel: 1 },
      });
      expectObservable(aggergator._inboundRTCStatsStream).toEqual($expect);
    });
  });

  it('should report outbound rtp stats', () => {
    scheduler.run(({ expectObservable, cold }) => {
      const $source = cold('a 10ms a 10ms a', { a: 1 });
      mockInterval.mockReturnValue($source);
      const aggergator = new RTCStatsAggregator(mockRTC as never);
      const $expect = cold('a 10ms a 10ms a', {
        a: { nackCount: 1 },
      });
      expectObservable(aggergator._outboundRTCStatsStream).toEqual($expect);
    });
  });
});
