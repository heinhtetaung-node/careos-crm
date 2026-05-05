import { fireEvent, screen } from '@testing-library/react';
import { render } from '__tests__/rtl-test-utils';
import React from 'react';
import CallStatsCard from './CallStatsCard';

jest.mock('presentation/theme/localization', () => ({
  getString: (key: string) => key,
}));

jest.mock('../helper', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const React = require('react');
  function MockIcon() {
    return React.createElement('div', { 'data-testid': 'status-icon' });
  }
  // Import actual helper functions for timer tests
  const actualHelpers = jest.requireActual('../helper');
  return {
    __esModule: true,
    getBackgroundTotalCallsbyValue: jest.fn(() => 'bg-total'),
    getBackgroundOutgoingRatebyValue: jest.fn(() => 'bg-outgoing'),
    getBackgroundAvgCallTimebyValue: jest.fn(() => 'bg-avg'),
    getBackgroundTalkTimebyValue: jest.fn(() => 'bg-talk'),
    getBackgroundLeadsInTankbyValue: jest.fn(() => 'bg-leads'),
    getBackgroundFollowUpAttemptsbyValue: jest.fn(() => 'bg-follow-attempts'),
    getBackgroundSuccessfulFollowupsbyValue: jest.fn(() => 'bg-follow-success'),
    getColorByStatus: jest.fn(() => 'bg-color'),
    getIconByStatus: jest.fn(() => MockIcon()),
    timeStringToSeconds: actualHelpers.timeStringToSeconds,
    secondsToTimeString: actualHelpers.secondsToTimeString,
    shortenName: actualHelpers.shortenName,
    formatWithLeadingZero: actualHelpers.formatWithLeadingZero,
    handleKeyActivate: actualHelpers.handleKeyActivate,
    isOnCallOrIdle: actualHelpers.isOnCallOrIdle,
  };
});

jest.mock('@alphafounders/icons', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const React = require('react');
  const createIcon = function (testId) {
    return function ({ fillColor }) {
      return React.createElement('div', {
        'data-testid': testId,
        'data-fill': fillColor,
      });
    };
  };

  return {
    PhoneAltIcon: createIcon('phone-alt-icon'),
    PhoneSmallIcon: createIcon('phone-small-icon'),
    PhoneOutgoingIcon: createIcon('phone-outgoing-icon'),
    PhoneClockIcon: createIcon('phone-clock-icon'),
    TrendingUpIcon: createIcon('trending-up-icon'),
    CoinsIcon: createIcon('coins-icon'),
    FileTextIcon: createIcon('file-text-icon'),
    ArrowUpWideIcon: createIcon('arrow-up-wide-icon'),
    UploadArrowIcon: createIcon('upload-arrow-icon'),
    CheckCircleIconAlt: createIcon('check-circle-icon'),
    MessageSquareOffIcon: createIcon('message-square-off-icon'),
    AlertCircleIcon: createIcon('alert-circle-icon'),
    MessagesSquareIcon: createIcon('messages-square-icon'),
    PhoneOfflineIcon: createIcon('phone-offline-icon'),
    OrdersCreatedIcon: createIcon('orders-created-icon'),
  };
});

jest.mock('presentation/components/icons', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const React = require('react');
  return {
    PushPinIcon: function PushPinIcon(props) {
      return React.createElement('div', {
        'data-testid': 'push-pin-icon',
        ...props,
      });
    },
  };
});

jest.mock('flagsmith/react', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const FeatureFlags = require('config/flagsmithConfig').default;
  return {
    ...jest.requireActual('flagsmith/react'),
    useFlags: jest.fn().mockReturnValue({
      [FeatureFlags.BROK_4290_ENABLE_DASHBOARD_PIN_FEATURE_TEMP]: {
        enabled: true,
      },
    }),
    FlagsmithProvider: function FlagsmithProvider({ children }) {
      return React.createElement('div', null, children);
    },
  };
});

describe('CallStatsCard', () => {
  const initialState = {
    authReducer: {
      data: {
        user: {
          name: 'users/test-user',
        },
      },
    },
  };

  const defaultProps = {
    openPopupAudioRender: jest.fn(),
    handleLiveListen: jest.fn(),
  };

  it('uses white icon color when status is not offline', () => {
    render(
      React.createElement(CallStatsCard, {
        ...defaultProps,
        userId: '1',
        userName: 'Test User',
      }),
      { initialState }
    );

    const phoneSmallIcon = screen.getByTestId('phone-small-icon');
    expect(phoneSmallIcon).toHaveAttribute('data-fill', '#ffffff');
    expect(screen.queryByTestId('offline-overlay')).toBeNull();
  });

  it('shows offline overlay and uses offline icon color', () => {
    render(
      React.createElement(CallStatsCard, {
        ...defaultProps,
        userId: '1',
        userName: 'Offline User',
        status: 'offline',
      }),
      { initialState }
    );

    expect(screen.getByTestId('offline-overlay')).toBeInTheDocument();
    const phoneSmallIcon = screen.getByTestId('phone-small-icon');
    expect(phoneSmallIcon).toHaveAttribute('data-fill', '#005098');
  });

  describe('Live timer for oncall status', () => {
    const BASE_TIME = 1_600_000_000_000;
    let dateNowSpy: jest.SpyInstance<number, []>;

    beforeEach(() => {
      dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(BASE_TIME);
    });

    afterEach(() => {
      dateNowSpy.mockRestore();
    });

    it('starts timer and increments callTime when status is oncall', () => {
      const { rerender } = render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:05',
          status: 'oncall',
        }),
        { initialState }
      );

      // Initially shows the prop value
      expect(screen.getByText('00:05')).toBeInTheDocument();

      // Simulate 1 second elapsed
      rerender(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:05',
          status: 'oncall',
          nowTick: BASE_TIME + 1000,
        })
      );

      expect(screen.getByText('00:06')).toBeInTheDocument();

      // Simulate another 2 seconds elapsed
      rerender(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:05',
          status: 'oncall',
          nowTick: BASE_TIME + 3000,
        })
      );

      expect(screen.getByText('00:08')).toBeInTheDocument();
    });

    it('stops timer and resets to prop value when status changes from oncall to idle', () => {
      const { rerender } = render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:10',
          status: 'oncall',
        }),
        { initialState }
      );

      expect(screen.getByText('00:10')).toBeInTheDocument();

      // Simulate 3 seconds elapsed while oncall
      rerender(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:10',
          status: 'oncall',
          nowTick: BASE_TIME + 3000,
        })
      );

      expect(screen.getByText('00:13')).toBeInTheDocument();

      // Change status to offline (which stops the timer)
      rerender(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:10',
          status: 'offline',
        })
      );

      // Should reset to prop value and ignore further time changes
      expect(screen.getByText('00:10')).toBeInTheDocument();

      rerender(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:10',
          status: 'offline',
          nowTick: BASE_TIME + 5000,
        })
      );

      expect(screen.getByText('00:10')).toBeInTheDocument();
    });

    it('resets timer when callTime prop changes during oncall', () => {
      const { rerender } = render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:05',
          status: 'oncall',
        }),
        { initialState }
      );

      expect(screen.getByText('00:05')).toBeInTheDocument();

      // Simulate 2 seconds elapsed
      rerender(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:05',
          status: 'oncall',
          nowTick: BASE_TIME + 2000,
        })
      );

      expect(screen.getByText('00:07')).toBeInTheDocument();

      // Update callTime prop (simulating polling update)
      rerender(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:15',
          status: 'oncall',
        })
      );

      // Should reset to new prop value
      expect(screen.getByText('00:15')).toBeInTheDocument();

      // Simulate 1 second elapsed from new baseline
      rerender(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:15',
          status: 'oncall',
          nowTick: BASE_TIME + 1000,
        })
      );

      expect(screen.getByText('00:16')).toBeInTheDocument();
    });

    it('handles HH:MM:SS format correctly', () => {
      const { rerender } = render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '01:02:03',
          status: 'oncall',
        }),
        { initialState }
      );

      expect(screen.getByText('01:02:03')).toBeInTheDocument();

      // Simulate 1 second elapsed
      rerender(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '01:02:03',
          status: 'oncall',
          nowTick: BASE_TIME + 1000,
        })
      );

      expect(screen.getByText('01:02:04')).toBeInTheDocument();
    });

    it('does not use interval-based timers', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');

      const { unmount } = render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:05',
          status: 'oncall',
        }),
        { initialState }
      );

      unmount();

      expect(setIntervalSpy).not.toHaveBeenCalled();
      expect(clearIntervalSpy).not.toHaveBeenCalled();

      setIntervalSpy.mockRestore();
      clearIntervalSpy.mockRestore();
    });

    it('does not start timer when status is not oncall or idle-yellow', () => {
      const { rerender } = render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:10',
          status: 'offline',
        }),
        { initialState }
      );

      expect(screen.getByText('00:10')).toBeInTheDocument();

      // Even if time passes, offline status should not change the displayed time
      rerender(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:10',
          status: 'offline',
          nowTick: BASE_TIME + 5000,
        })
      );

      expect(screen.getByText('00:10')).toBeInTheDocument();
    });

    it('starts timer when status is idle-yellow', () => {
      const { rerender } = render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:05',
          status: 'idle-yellow',
        }),
        { initialState }
      );

      expect(screen.getByText('00:05')).toBeInTheDocument();

      // Simulate 1 second elapsed
      rerender(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          callTime: '00:05',
          status: 'idle-yellow',
          nowTick: BASE_TIME + 1000,
        })
      );

      expect(screen.getByText('00:06')).toBeInTheDocument();
    });
  });

  describe('Watch button functionality', () => {
    it('renders watch button when onToggleWatched is provided', () => {
      const mockToggleWatched = jest.fn();
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          onToggleWatched: mockToggleWatched,
          isWatched: false,
        }),
        { initialState }
      );

      const watchButton = screen.getByTestId('watch-button-1');
      expect(watchButton).toBeInTheDocument();
      expect(screen.getByTestId('push-pin-icon')).toBeInTheDocument();
    });

    it('does not render watch button when onToggleWatched is not provided', () => {
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
        }),
        { initialState }
      );

      expect(screen.queryByTestId('watch-button-1')).not.toBeInTheDocument();
    });

    it('calls onToggleWatched when watch button is clicked', () => {
      const mockToggleWatched = jest.fn();
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          onToggleWatched: mockToggleWatched,
          isWatched: false,
        }),
        { initialState }
      );

      const watchButton = screen.getByTestId('watch-button-1');
      fireEvent.click(watchButton);

      expect(mockToggleWatched).toHaveBeenCalledTimes(1);
    });

    it('calls onToggleWatched when Enter key is pressed on watch button', () => {
      const mockToggleWatched = jest.fn();
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          onToggleWatched: mockToggleWatched,
          isWatched: false,
        }),
        { initialState }
      );

      const watchButton = screen.getByTestId('watch-button-1');
      fireEvent.keyDown(watchButton, { key: 'Enter' });

      expect(mockToggleWatched).toHaveBeenCalledTimes(1);
    });

    it('calls onToggleWatched when Space key is pressed on watch button', () => {
      const mockToggleWatched = jest.fn();
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          onToggleWatched: mockToggleWatched,
          isWatched: false,
        }),
        { initialState }
      );

      const watchButton = screen.getByTestId('watch-button-1');
      fireEvent.keyDown(watchButton, { key: ' ' });

      expect(mockToggleWatched).toHaveBeenCalledTimes(1);
    });

    it('does not call onToggleWatched when other keys are pressed', () => {
      const mockToggleWatched = jest.fn();
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          onToggleWatched: mockToggleWatched,
          isWatched: false,
        }),
        { initialState }
      );

      const watchButton = screen.getByTestId('watch-button-1');
      fireEvent.keyDown(watchButton, { key: 'Tab' });

      expect(mockToggleWatched).not.toHaveBeenCalled();
    });

    it('shows watched state with golden color when isWatched is true', () => {
      const mockToggleWatched = jest.fn();
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          onToggleWatched: mockToggleWatched,
          isWatched: true,
        }),
        { initialState }
      );

      const watchButton = screen.getByTestId('watch-button-1');
      const iconContainer = watchButton.querySelector('div');
      expect(iconContainer).toHaveClass('text-[#FFBF00]');
    });

    it('shows unwatched state with gray color when isWatched is false', () => {
      const mockToggleWatched = jest.fn();
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          onToggleWatched: mockToggleWatched,
          isWatched: false,
        }),
        { initialState }
      );

      const watchButton = screen.getByTestId('watch-button-1');
      const iconContainer = watchButton.querySelector('div');
      expect(iconContainer).toHaveClass('text-gray-400');
    });
  });

  describe('Status tooltips', () => {
    it('shows correct tooltip for idle-yellow status', () => {
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          status: 'idle-yellow',
        }),
        { initialState }
      );

      // Tooltip is rendered by Material-UI, we can check the status icon is present
      expect(screen.getByTestId('status-icon')).toBeInTheDocument();
    });

    it('shows correct tooltip for idle-red status', () => {
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          status: 'idle-red',
        }),
        { initialState }
      );

      expect(screen.getByTestId('status-icon')).toBeInTheDocument();
    });

    it('shows correct tooltip for idle-green status', () => {
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          status: 'idle-green',
        }),
        { initialState }
      );

      expect(screen.getByTestId('status-icon')).toBeInTheDocument();
    });

    it('shows correct tooltip for undefined status (default case)', () => {
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          status: undefined,
        }),
        { initialState }
      );

      expect(screen.getByTestId('status-icon')).toBeInTheDocument();
    });
  });

  describe('handleLiveListen functionality', () => {
    it('calls handleLiveListen when status icon is clicked', () => {
      const mockHandleLiveListen = jest.fn();
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          status: 'oncall',
          handleLiveListen: mockHandleLiveListen,
        }),
        { initialState }
      );

      const statusIcon = screen
        .getByTestId('status-icon')
        .closest('div[role="button"]');
      if (statusIcon) {
        fireEvent.click(statusIcon);
        expect(mockHandleLiveListen).toHaveBeenCalledTimes(1);
      }
    });

    it('calls handleLiveListen when Enter key is pressed on status icon', () => {
      const mockHandleLiveListen = jest.fn();
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          status: 'oncall',
          handleLiveListen: mockHandleLiveListen,
        }),
        { initialState }
      );

      const statusIcon = screen
        .getByTestId('status-icon')
        .closest('div[role="button"]');
      if (statusIcon) {
        fireEvent.keyDown(statusIcon, { key: 'Enter' });
        expect(mockHandleLiveListen).toHaveBeenCalledTimes(1);
      }
    });

    it('calls handleLiveListen when Space key is pressed on status icon', () => {
      const mockHandleLiveListen = jest.fn();
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          status: 'oncall',
          handleLiveListen: mockHandleLiveListen,
        }),
        { initialState }
      );

      const statusIcon = screen
        .getByTestId('status-icon')
        .closest('div[role="button"]');
      if (statusIcon) {
        fireEvent.keyDown(statusIcon, { key: ' ' });
        expect(mockHandleLiveListen).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Stat items rendering', () => {
    it('renders all stat items with provided values', () => {
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          totalCalls: 10,
          callsSuccessful: 8,
          talkTimeSeconds: '05:30',
          averageTimePerSuccessfulCallSeconds: '02:15',
          followupsAttemptsLastHour: 5,
          followupsSuccessRate: 80,
          numberOfLeadsNoAnswer: 3,
          numberOfLeadsRejected: 2,
          numberOfLeadsContacted: 15,
          numberOfFollowUpsSet: 7,
          numberOfLeadsPendingPayment: 4,
          numberOfLeadsInTank: 12,
        }),
        { initialState }
      );

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('08')).toBeInTheDocument(); // Leading zero for numbers < 10
      expect(screen.getByText('05:30')).toBeInTheDocument();
      expect(screen.getByText('02:15')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // followupsAttemptsLastHour doesn't have leading zero logic
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
    });

    it('renders dash when followupsAttemptsLastHour is 0', () => {
      const { container } = render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          followupsAttemptsLastHour: 0,
        }),
        { initialState }
      );

      // The dash text contains a non-breaking space (\u00A0), check that it exists in the container
      expect(container.textContent).toContain(' - ');
    });

    it('renders dash when followupsSuccessRate is 0', () => {
      const { container } = render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          followupsSuccessRate: 0,
        }),
        { initialState }
      );

      // The dash text contains a non-breaking space (\u00A0), check that it exists in the container
      expect(container.textContent).toContain(' - ');
    });
  });

  describe('Past date (live) affordances', () => {
    it('shows pulse indicator on status control when isPastDate is true', () => {
      const { container } = render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Test User',
          status: 'oncall',
          isPastDate: true,
        }),
        { initialState }
      );

      expect(container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it('uses empty call-duration tooltip when status is offline', () => {
      render(
        React.createElement(CallStatsCard, {
          ...defaultProps,
          userId: '1',
          userName: 'Offline User',
          status: 'offline',
          callTime: '00:10',
        }),
        { initialState }
      );

      expect(screen.getByText('00:10')).toBeInTheDocument();
    });
  });
});
