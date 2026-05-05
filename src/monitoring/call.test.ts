import { waitFor } from '@testing-library/dom';

import CallMonitor from './call';

var mockInteraction = {
  setAttribute: jest.fn(),
  setName: jest.fn(),
  save: jest.fn(),
};

global.newrelic = {
  interaction: () => null,
} as any;

const interaction = jest.spyOn(newrelic, 'interaction');
jest.useFakeTimers();

describe('CallMonitor', () => {
  test('should report stats', async () => {
    interaction.mockReturnValue(mockInteraction as any);
    const mockRTC = {
      iceConnectionState: 'connecting',
      getStats: jest.fn().mockReturnValue([
        {
          type: 'outbound-rtp',
          attr: 'attr',
        },
        {
          type: 'inbound-rtp',
          attr: 'attr',
        },
        {
          type: 'media-playout',
          attr: 'attr',
        },
        {
          type: 'media-source',
          attr: 'attr',
        },
      ]),
    };
    const monitor = new CallMonitor(mockRTC as any);
    jest.advanceTimersByTime(1000);
    await waitFor(() => expect(mockInteraction.save).toHaveBeenCalledTimes(4));
    monitor.reportStatistics([
      {
        type: 'outbound-rtp',
        attr: 'attr',
      },
      {
        type: 'inbound-rtp',
        attr: 'attr',
      },
      {
        type: 'media-playout',
        attr: 'attr',
      },
      {
        type: 'media-source',
        attr: 'attr',
      },
    ] as any);
    expect(mockInteraction.setAttribute).toHaveBeenCalledTimes(8);
    monitor.end();
  });
});
