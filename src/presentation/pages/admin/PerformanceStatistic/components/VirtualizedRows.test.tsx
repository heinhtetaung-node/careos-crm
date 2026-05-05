import { render } from '@testing-library/react';
import React from 'react';

import type { PerformanceCardData } from '../helper';
import VirtualizedRows from './VirtualizedRows';

const receivedCardProps: Record<string, unknown>[] = [];

jest.mock('./CallStatsCard', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: function MockCallStatsCard(props: Record<string, unknown>) {
      receivedCardProps.push(props);
      return React.createElement('div', {
        'data-testid': `virtual-card-${props.userId}`,
      });
    },
  };
});

function baseCard(
  overrides: Partial<PerformanceCardData>
): PerformanceCardData {
  return {
    userId: 'u-default',
    userName: 'Agent',
    callTime: '00:01',
    totalCalls: 0,
    callsSuccessful: 0,
    talkTimeSeconds: '00:00',
    averageTimePerSuccessfulCallSeconds: '00:00',
    numberOfLeadsInTank: 0,
    followupsAttemptsLastHour: 0,
    followupsSuccessRate: 0,
    numberOfLeadsNoAnswer: 0,
    numberOfLeadsRejected: 0,
    numberOfLeadsContacted: 0,
    numberOfFollowUpsSet: 0,
    numberOfLeadsPendingPayment: 0,
    numberOfOrdersCreated: 0,
    status: 'oncall',
    followupsAttempts: 0,
    followupsSuccessful: 0,
    activeCallId: 'calls/c1',
    leadId: 'leads/l1',
    leadHumanId: '',
    ...overrides,
  };
}

describe('VirtualizedRows', () => {
  beforeEach(() => {
    receivedCardProps.length = 0;
  });

  it('passes nowTick only when card status is in liveTimerStatuses', () => {
    const nowTick = 9_000_000;
    const liveTimerStatuses = new Set<string>(['oncall']);
    const performanceCards = [
      baseCard({ userId: 'live', status: 'oncall' }),
      baseCard({ userId: 'idle', status: 'offline' }),
    ];

    render(
      <VirtualizedRows
        virtualRows={[{ key: 'r0', index: 0, start: 0 }]}
        totalHeight={400}
        scrollMargin={12}
        columnCount={2}
        performanceCards={performanceCards}
        nowTick={nowTick}
        watchedUserIds={new Set()}
        onToggleWatched={jest.fn()}
        handleLiveListen={jest.fn()}
        openPopupAudioRender={jest.fn()}
        cardRowHeightClass="h-[260px]"
        liveTimerStatuses={liveTimerStatuses}
      />
    );

    const live = receivedCardProps.find((p) => p.userId === 'live') as
      | { nowTick?: number }
      | undefined;
    const idle = receivedCardProps.find((p) => p.userId === 'idle') as
      | { nowTick?: number }
      | undefined;
    expect(live?.nowTick).toBe(nowTick);
    expect(idle?.nowTick).toBeUndefined();
  });

  it('defaults isPastDate to false on cards when omitted', () => {
    const performanceCards = [baseCard({ userId: 'u1' })];

    render(
      <VirtualizedRows
        virtualRows={[{ key: 'r0', index: 0, start: 0 }]}
        totalHeight={200}
        scrollMargin={0}
        columnCount={1}
        performanceCards={performanceCards}
        nowTick={1}
        watchedUserIds={new Set()}
        onToggleWatched={jest.fn()}
        handleLiveListen={jest.fn()}
        openPopupAudioRender={jest.fn()}
        cardRowHeightClass="h-[260px]"
        liveTimerStatuses={new Set(['oncall'])}
      />
    );

    expect(receivedCardProps[0]?.isPastDate as boolean).toBe(false);
  });

  it('forwards isPastDate to cards', () => {
    const performanceCards = [baseCard({ userId: 'u1' })];

    render(
      <VirtualizedRows
        virtualRows={[{ key: 'r0', index: 0, start: 0 }]}
        totalHeight={200}
        scrollMargin={0}
        columnCount={1}
        performanceCards={performanceCards}
        nowTick={1}
        watchedUserIds={new Set()}
        onToggleWatched={jest.fn()}
        handleLiveListen={jest.fn()}
        openPopupAudioRender={jest.fn()}
        cardRowHeightClass="h-[260px]"
        liveTimerStatuses={new Set(['oncall'])}
        isPastDate
      />
    );

    expect(receivedCardProps[0]?.isPastDate as boolean).toBe(true);
  });
});
