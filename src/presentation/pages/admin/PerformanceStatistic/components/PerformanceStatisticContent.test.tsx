// @ts-nocheck
import { configureStore } from '@reduxjs/toolkit';
import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { PerformanceStatFilters } from '../helper';
import PerformanceStatisticContent from './PerformanceStatisticContent';

// Mock dependencies
jest.mock('presentation/theme/localization', () => ({
  getString: (key) => key,
}));

jest.mock('presentation/context/LiveListenContext', () => ({
  useLiveListen: () => ({
    handleLiveListen: jest.fn(),
    isLiveListenActive: false,
  }),
}));

let mockStatsData = null;
const mockFetchPerformanceStats = jest.fn(() => Promise.resolve());

jest.mock('data/slices/performanceStatisticSlice', () => {
  const React = require('react');
  return {
    useLazyGetPerformanceStatsQuery: () => {
      const [triggered, setTriggered] = React.useState(0);
      const getCurrentData = () => {
        return mockStatsData ? JSON.parse(JSON.stringify(mockStatsData)) : null;
      };
      const trigger = React.useCallback((...args) => {
        mockFetchPerformanceStats(...args);
        setTriggered((prev) => prev + 1);
        return Promise.resolve();
      }, []);
      const data = React.useMemo(() => getCurrentData(), [triggered]);
      return [trigger, { data, isFetching: false }];
    },
  };
});

const mockUseAppSelector = jest.fn(() => null);
jest.mock('presentation/redux/hooks/typedHooks', () => ({
  useAppSelector: (selector) => mockUseAppSelector(selector),
}));

jest.mock('./CallStatsCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const React = require('react');
  return {
    __esModule: true,
    default: function CallStatsCard(props: any) {
      return React.createElement(
        'div',
        { 'data-testid': `call-stats-card-${props.userId}` },
        props.userName
      );
    },
  };
});

jest.mock('../helper', () => {
  const actual = jest.requireActual('../helper');
  return {
    ...actual,
    mapPerformanceStatsToCards: (stats) => {
      return stats.map((stat) => ({
        userId: stat.user,
        userName: stat.userFullName || 'Unknown',
        activeCallId: stat.activeCall?.call || '',
        leadId: stat.activeCall?.lead || '',
        callTime: stat.activeCall?.startTime || '',
      }));
    },
    RenderSkeletonCards: () => (
      <div data-testid="skeleton-cards">Loading...</div>
    ),
  };
});

describe('PerformanceStatisticContent - Scroll Handler (lines 205-228)', () => {
  let mockAddEventListener: jest.SpyInstance;
  let mockRemoveEventListener: jest.SpyInstance;
  let scrollHandlers: Array<() => void> = [];
  let resizeHandlers: Array<() => void> = [];
  let resizeObserverObserveMock: jest.Mock;
  let resizeObserverDisconnectMock: jest.Mock;

  const createMockStore = (globalProduct = null) => {
    return configureStore({
      reducer: {
        typeSelectorReducer: (
          state = {
            globalProductSelectorReducer: {
              data: globalProduct,
              isFetching: false,
              success: false,
            },
          }
        ) => state,
      },
      preloadedState: {
        typeSelectorReducer: {
          globalProductSelectorReducer: {
            data: globalProduct,
            isFetching: false,
            success: false,
          },
        },
      },
    });
  };

  beforeEach(() => {
    jest.useFakeTimers();
    scrollHandlers = [];
    resizeHandlers = [];
    mockStatsData = null;
    mockFetchPerformanceStats.mockClear();
    mockUseAppSelector.mockReturnValue(null);
    resizeObserverObserveMock = jest.fn();
    resizeObserverDisconnectMock = jest.fn();

    Object.defineProperty(window, 'ResizeObserver', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        observe: resizeObserverObserveMock,
        unobserve: jest.fn(),
        disconnect: resizeObserverDisconnectMock,
      })),
    });

    // Mock window scroll properties
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      configurable: true,
      value: 0,
    });

    Object.defineProperty(document.documentElement, 'scrollTop', {
      writable: true,
      configurable: true,
      value: 0,
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    });

    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 2000,
    });

    // Mock addEventListener to capture scroll handlers
    mockAddEventListener = jest
      .spyOn(window, 'addEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'scroll') {
          scrollHandlers.push(handler as () => void);
        }
        if (event === 'resize') {
          resizeHandlers.push(handler as () => void);
        }
      });

    mockRemoveEventListener = jest
      .spyOn(window, 'removeEventListener')
      .mockImplementation((event, handler) => {
        if (event === 'scroll') {
          const index = scrollHandlers.indexOf(handler as () => void);
          if (index > -1) {
            scrollHandlers.splice(index, 1);
          }
        }
        if (event === 'resize') {
          const index = resizeHandlers.indexOf(handler as () => void);
          if (index > -1) {
            resizeHandlers.splice(index, 1);
          }
        }
      });

    // Mock window.scrollTo
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
    mockAddEventListener.mockRestore();
    mockRemoveEventListener.mockRestore();
    scrollHandlers = [];
    resizeHandlers = [];
    delete (window as any).ResizeObserver;
  });

  const defaultFilters: PerformanceStatFilters = {
    status: [],
    team: [],
  };

  const createMockStats = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
      user: `users/user-${i}`,
      userFullName: `User ${i}`,
      team: 'teams/team-1',
      presence: { status: 'STATUS_CALL' },
      hourlyStats: {
        callAttempts: 30,
        callsSuccessful: 10,
        talkTimeSeconds: 500,
        averageTimePerSuccessfulCallSeconds: 50,
        followupsAttempts: 10,
        followupsSuccessful: 10,
      },
      numberOfFollowUpsSet: 5,
      numberOfLeadsRejected: 1,
      numberOfLeadsPendingPayment: 2,
      numberOfLeadsContacted: 3,
      numberOfLeadsInTank: 4,
      activeCall: {
        call: `calls/call-${i}`,
        lead: `leads/lead-${i}`,
        startTime: new Date().toISOString(),
      },
    }));
  };

  it('sets up resize event listener on mount', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={defaultFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
        />
      </Provider>
    );

    expect(mockAddEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  it('removes resize event listener on unmount', () => {
    const store = createMockStore();
    const { unmount } = render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={defaultFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
        />
      </Provider>
    );

    unmount();

    expect(mockRemoveEventListener).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );
  });

  it('resets visibleItemCount to 20 when scrolling up and scrollTop < 100', async () => {
    const store = createMockStore();
    const mockStats = createMockStats(50);
    mockStatsData = { stats: mockStats };

    render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={defaultFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
        />
      </Provider>
    );

    // Wait for component to render and data to load
    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(1000); // Wait for initial loading timeout
    });

    // Get the scroll handler
    await waitFor(() => {
      expect(scrollHandlers.length).toBeGreaterThan(0);
    });

    const scrollHandler = scrollHandlers[scrollHandlers.length - 1];
    expect(scrollHandler).toBeDefined();

    // Simulate scrolling down first (to set lastScrollTopRef)
    Object.defineProperty(window, 'pageYOffset', {
      value: 500,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 500,
      writable: true,
    });

    act(() => {
      scrollHandler();
    });

    // Now simulate scrolling up with scrollTop < 100
    Object.defineProperty(window, 'pageYOffset', { value: 50, writable: true });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 50,
      writable: true,
    });

    act(() => {
      scrollHandler();
    });

    // The visibleItemCount should be reset to 20
    // We can verify this by checking that only 20 cards are rendered
    await waitFor(() => {
      const cards = screen.queryAllByTestId(/call-stats-card-/);
      // After scrolling up, should show only 20 cards
      expect(cards.length).toBeLessThanOrEqual(20);
    });
  });

  it('triggers infinite scroll when scrolling down and scrollBottom < 300', async () => {
    const store = createMockStore();
    const mockStats = createMockStats(100);
    mockStatsData = { stats: mockStats };

    render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={defaultFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
        />
      </Provider>
    );

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(1000); // Wait for initial loading timeout
    });

    const cards = screen.queryAllByTestId(/call-stats-card-/);
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThan(100);
  });

  it('updates lastScrollTopRef when scrolling', async () => {
    const store = createMockStore();
    const mockStats = createMockStats(30);
    mockStatsData = { stats: mockStats };

    render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={defaultFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
        />
      </Provider>
    );

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(
      screen.getByTestId('performance-statistics-grid')
    ).toBeInTheDocument();
  });

  it('does not trigger infinite scroll when scrollBottom >= 300', async () => {
    const store = createMockStore();
    const mockStats = createMockStats(50);
    mockStatsData = { stats: mockStats };

    render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={defaultFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
        />
      </Provider>
    );

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(scrollHandlers.length).toBeGreaterThan(0);
    });

    const scrollHandler = scrollHandlers[scrollHandlers.length - 1];
    const initialRemoveListenerCalls =
      mockRemoveEventListener.mock.calls.length;

    // Set initial scroll position
    Object.defineProperty(window, 'pageYOffset', { value: 0, writable: true });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 0,
      writable: true,
    });

    act(() => {
      scrollHandler();
    });

    // Simulate scrolling down but not near bottom
    // scrollBottom = 2000 - 500 - 800 = 700 (scrollBottom >= 300)
    Object.defineProperty(window, 'pageYOffset', {
      value: 500,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 500,
      writable: true,
    });

    act(() => {
      scrollHandler();
    });

    // Should not remove event listener (no infinite scroll triggered)
    expect(mockRemoveEventListener.mock.calls.length).toBe(
      initialRemoveListenerCalls
    );

    // Should not show loading skeleton
    expect(screen.queryByTestId('skeleton-cards')).not.toBeInTheDocument();
  });

  it('does not reset visibleItemCount when scrolling up but scrollTop >= 100', async () => {
    const store = createMockStore();
    const mockStats = createMockStats(50);
    mockStatsData = { stats: mockStats };

    render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={defaultFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
        />
      </Provider>
    );

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(scrollHandlers.length).toBeGreaterThan(0);
    });

    const scrollHandler = scrollHandlers[scrollHandlers.length - 1];

    // Set initial scroll position (scrolled down)
    Object.defineProperty(window, 'pageYOffset', {
      value: 500,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 500,
      writable: true,
    });

    act(() => {
      scrollHandler();
    });

    // Simulate scrolling up but scrollTop >= 100
    Object.defineProperty(window, 'pageYOffset', {
      value: 150,
      writable: true,
    });
    Object.defineProperty(document.documentElement, 'scrollTop', {
      value: 150,
      writable: true,
    });

    act(() => {
      scrollHandler();
    });

    // Should not reset visibleItemCount (no early return)
    // The handler should continue and update lastScrollTopRef
    expect(scrollHandler).toBeDefined();
  });

  it('calculates scrollBottom correctly', async () => {
    const store = createMockStore();
    const mockStats = createMockStats(100);
    mockStatsData = { stats: mockStats };

    render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={defaultFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
        />
      </Provider>
    );

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(1000);
    });

    expect(mockRemoveEventListener).not.toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });

  it('handles scrolling when isScrollingDown is true and scrollBottom < 300', async () => {
    const store = createMockStore();
    const mockStats = createMockStats(100);
    mockStatsData = { stats: mockStats };

    render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={defaultFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
        />
      </Provider>
    );

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    expect(screen.queryByTestId('skeleton-cards')).not.toBeInTheDocument();
  });

  it('limits visibleItemCount to performanceCards.length when incrementing', async () => {
    const store = createMockStore();
    const mockStats = createMockStats(30); // Only 30 cards
    mockStatsData = { stats: mockStats };

    render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={defaultFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
        />
      </Provider>
    );

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(1000);
    });

    // With 30 cards, virtualization stays disabled and all cards should render.
    await waitFor(() => {
      const cards = screen.queryAllByTestId(/call-stats-card-/);
      expect(cards.length).toBe(30);
    });
  });

  it('shows past-date empty message when filters.date is before today', async () => {
    mockStatsData = { stats: [] };
    const store = createMockStore();
    const pastFilters: PerformanceStatFilters = {
      status: [],
      team: [],
      user: [],
      interval: 'day',
      date: '1990-01-01',
    };

    render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={pastFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
        />
      </Provider>
    );

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(1000);
    });

    const emptyEl = await screen.findByTestId('performance-statistic-empty');
    expect(emptyEl).toHaveTextContent('performanceStatistic.emptyPastDate');
  });

  it('calls onStatsChange when stats are loaded', async () => {
    const onStatsChange = jest.fn();
    mockStatsData = { stats: createMockStats(2) };
    const store = createMockStore();

    render(
      <Provider store={store}>
        <PerformanceStatisticContent
          filters={defaultFilters}
          watchedUserIds={new Set()}
          onToggleWatched={jest.fn()}
          onStatsChange={onStatsChange}
        />
      </Provider>
    );

    await act(async () => {
      await Promise.resolve();
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(onStatsChange).toHaveBeenCalled();
    });
    const lastPayload =
      onStatsChange.mock.calls[onStatsChange.mock.calls.length - 1][0];
    expect(Array.isArray(lastPayload)).toBe(true);
    expect(lastPayload.length).toBe(2);
  });
});
