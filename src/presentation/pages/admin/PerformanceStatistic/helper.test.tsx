import React from 'react';
import { render } from '@testing-library/react';
import {
  COLORS,
  getStatusOptions,
  filterFields,
  initialFilterValues,
  getColorByStatus,
  getIconByStatus,
  mapPresenceStatusToCardStatus,
  formatSecondsToTime,
  calculatePercentage,
  mapPerformanceStatsToCards,
  getBackgroundTotalCallsbyValue,
  getBackgroundOutgoingRatebyValue,
  getBackgroundAvgCallTimebyValue,
  getBackgroundTalkTimebyValue,
  getBackgroundLeadsInTankbyValue,
  getBackgroundFollowUpAttemptsbyValue,
  getBackgroundSuccessfulFollowupsbyValue,
  getTeamIdFromMember,
  RenderSkeletonCards,
  timeStringToSeconds,
  secondsToTimeString,
} from './helper';

jest.mock(
  'presentation/theme/localization',
  () => ({
    getString: (key) => key,
  }),
  { virtual: true }
);
jest.mock(
  '../../theme/localization',
  () => ({
    getString: (key) => key,
  }),
  { virtual: true }
);
jest.mock(
  'presentation/components/controls/Control',
  () => ({
    __esModule: true,
    default: {
      Select: 'Select',
      Autocomplete: 'Autocomplete',
    },
  }),
  { virtual: true }
);
jest.mock(
  '../../components/controls/Control',
  () => ({
    __esModule: true,
    default: {
      Select: 'Select',
      Autocomplete: 'Autocomplete',
    },
  }),
  { virtual: true }
);
jest.mock('@alphafounders/icons', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const React = require('react');
  function createIcon(testId) {
    return function (props) {
      return React.createElement('div', {
        'data-testid': testId,
        className: props.className,
        'data-fill-color': props.fillColor,
      });
    };
  }
  return {
    PhoneAltIcon: createIcon('phone-alt-icon'),
    PhoneOfflineIcon: createIcon('phone-offline-icon'),
    IdleIcon: createIcon('idle-icon'),
  };
});
describe('PerformanceStatistic helper', () => {
  describe('COLORS', () => {
    test('should have correct color values', () => {
      expect(COLORS.green).toBe('#2FCE82');
      expect(COLORS.gray).toBe('#B0B0B0');
      expect(COLORS.red).toBe('#EA4548');
      expect(COLORS.yellow).toBe('#F78F1E');
    });
  });
  describe('getStatusOptions', () => {
    test('should return correct status options', () => {
      const statusOptions = getStatusOptions();
      expect(statusOptions).toHaveLength(3);
      expect(statusOptions[0]).toMatchObject({
        key: 1,
        value: 'STATUS_CALL',
        name: 'STATUS_CALL',
      });
      expect(statusOptions[1]).toMatchObject({
        key: 2,
        value: 'STATUS_ONLINE',
        name: 'STATUS_ONLINE',
      });
      expect(statusOptions[2]).toMatchObject({
        key: 3,
        value: 'STATUS_AWAY',
        name: 'STATUS_AWAY',
      });
      // Check that title and displayName are translated strings (not hardcoded)
      expect(statusOptions[0].title).toBeTruthy();
      expect(statusOptions[0].displayName).toBeTruthy();
      expect(statusOptions[0].title).not.toBe('STATUS_CALL');
    });
  });
  describe('filterFields', () => {
    test('should return filter fields with correct structure', () => {
      const mockGetTeams = jest.fn();
      const fields = filterFields(mockGetTeams);
      expect(fields).toHaveLength(2);
      // InputComponent can be either the component (function) or string (from mock)
      // Check that it's defined and not null
      expect(fields[0].InputComponent).toBeDefined();
      expect(fields[0].InputComponent).not.toBeNull();
      expect(fields[0].inputProps.name).toBe('status');
      expect(fields[0].inputProps.label).toBe('text.status');
      expect(fields[0].inputProps.placeholder).toBe('text.select');
      const statusOptions = getStatusOptions();
      expect(fields[0].inputProps.options).toEqual(statusOptions);
      expect(fields[0].inputProps.labelField).toBe('title');
      expect(fields[0].inputProps.valueField).toBe('value');
      expect(fields[0].inputProps.multiple).toBe(true);
      expect(fields[0].inputProps.hasSelectAll).toBe(true);
      expect(fields[0].inputProps.fixedLabel).toBe(true);
      expect(fields[0].inputProps.filterType).toBe('summary');
      expect(fields[0].inputProps.responsive).toEqual({ xs: 6, md: 3 });
      // InputComponent can be either the component (function) or string (from mock)
      // Check that it's defined and not null
      expect(fields[1].InputComponent).toBeDefined();
      expect(fields[1].InputComponent).not.toBeNull();
      expect(fields[1].inputProps.name).toBe('team');
      expect(fields[1].inputProps.label).toBe('text.team');
      expect(fields[1].inputProps.placeholder).toBe('text.select');
      expect(fields[1].inputProps.labelField).toBe('displayName');
      expect(fields[1].inputProps.valueField).toBe('name');
      expect(fields[1].inputProps.async).toBe(false);
      expect(fields[1].inputProps.onFocusFn).toBe(mockGetTeams);
      expect(fields[1].inputProps.fixedLabel).toBe(true);
      expect(fields[1].inputProps.filterType).toBe('summary');
      expect(fields[1].inputProps.responsive).toEqual({ xs: 6, md: 3 });
      expect(fields[1].inputProps.hasSelectAll).toBe(true);
    });
  });
  describe('initialFilterValues', () => {
    test('should return correct initial values', () => {
      expect(initialFilterValues).toEqual({
        status: [],
        team: [],
        user: [],
        interval: '1h',
        date: '',
      });
    });
  });
  describe('getColorByStatus', () => {
    test('should return correct color for oncall status', () => {
      expect(getColorByStatus('oncall')).toBe('bg-[#2FCE82]');
    });
    test('should return correct color for offline status', () => {
      expect(getColorByStatus('offline')).toBe('bg-[#B0B0B0]');
    });
    test('should return correct color for idle-red status', () => {
      expect(getColorByStatus('idle-red')).toBe('bg-[#EA4548]');
    });
    test('should return correct color for idle-yellow status', () => {
      // Without callTime, should return default orange
      expect(getColorByStatus('idle-yellow')).toBe('bg-[#F78F1E]');
      expect(getColorByStatus('idle-yellow', '00:00')).toBe('bg-[#F78F1E]');
      expect(getColorByStatus('idle-yellow', '')).toBe('bg-[#F78F1E]');
      // With valid callTime
      expect(getColorByStatus('idle-yellow', '03:00')).toBe('bg-[#2FCE82]'); // < 5 minutes
      expect(getColorByStatus('idle-yellow', '08:00')).toBe('bg-[#F78F1E]'); // 5-10 minutes
      expect(getColorByStatus('idle-yellow', '15:00')).toBe('bg-[#EA4548]'); // > 10 minutes
    });
    test('should return correct color for idle-green status', () => {
      expect(getColorByStatus('idle-green')).toBe('bg-[#2FCE82]');
    });

    test('getColorByStatus handles invalid callTime format in idle-yellow (covers line 169)', () => {
      // When timeStringToMinutes throws an error, should catch and return default orange
      expect(getColorByStatus('idle-yellow', 'invalid-format')).toBe(
        'bg-[#F78F1E]'
      );
      expect(getColorByStatus('idle-yellow', 'not-a-time')).toBe(
        'bg-[#F78F1E]'
      );
    });

    test('getColorByStatus returns default color for unknown status (covers line 175)', () => {
      // @ts-expect-error - testing invalid status
      expect(getColorByStatus('unknown-status' as any)).toBe('bg-[#2FCE82]');
      // @ts-expect-error - testing invalid status
      expect(getColorByStatus('invalid' as any, '03:00')).toBe('bg-[#2FCE82]');
    });
  });
  describe('getIconByStatus', () => {
    const renderIconElement = (iconElement) =>
      iconElement.type(iconElement.props);

    test('should return PhoneAltIcon for oncall status', () => {
      const icon = getIconByStatus('oncall');
      const renderedIcon = renderIconElement(icon);
      expect(renderedIcon.props['data-testid']).toBe('phone-alt-icon');
      expect(renderedIcon.props['data-fill-color']).toBe('#ffffff');
      expect(icon.props.className).toBe('w-5 h-5');
    });
    test('should return PhoneOfflineIcon for offline status', () => {
      const icon = getIconByStatus('offline');
      const renderedIcon = renderIconElement(icon);
      expect(renderedIcon.props['data-testid']).toBe('phone-offline-icon');
      expect(renderedIcon.props['data-fill-color']).toBe('#ffffff');
      expect(icon.props.className).toBe('w-5.5 h-5.5');
    });
    test('should return IdleIcon for idle-red status', () => {
      const icon = getIconByStatus('idle-red');
      const renderedIcon = renderIconElement(icon);
      expect(renderedIcon.props['data-testid']).toBe('idle-icon');
      expect(renderedIcon.props['data-fill-color']).toBe('#ffffff');
      expect(icon.props.className).toBe('w-5 h-5');
    });
    test('should return IdleIcon for idle-yellow status', () => {
      const icon = getIconByStatus('idle-yellow');
      const renderedIcon = renderIconElement(icon);
      expect(renderedIcon.props['data-testid']).toBe('idle-icon');
      expect(renderedIcon.props['data-fill-color']).toBe('#ffffff');
      expect(icon.props.className).toBe('w-5 h-5');
    });
    test('should return IdleIcon for idle-green status', () => {
      const icon = getIconByStatus('idle-green');
      const renderedIcon = renderIconElement(icon);
      expect(renderedIcon.props['data-testid']).toBe('idle-icon');
      expect(renderedIcon.props['data-fill-color']).toBe('#ffffff');
      expect(icon.props.className).toBe('w-5 h-5');
    });
  });
  describe('performance stats helpers', () => {
    test('maps presence statuses correctly', () => {
      expect(mapPresenceStatusToCardStatus('STATUS_OFFLINE')).toBe('offline');
      expect(mapPresenceStatusToCardStatus('STATUS_IDLE_RED')).toBe('idle-red');
      expect(mapPresenceStatusToCardStatus(undefined)).toBe('oncall');
    });

    test('formats seconds into mm:ss', () => {
      expect(formatSecondsToTime(65)).toBe('01:05');
      expect(formatSecondsToTime(undefined)).toBe('00:00');
      expect(formatSecondsToTime(0)).toBe('00:00');
      expect(formatSecondsToTime(-10)).toBe('00:00');
    });

    test('formats seconds into HH:mm:ss when totalMinutes >= 60 (covers lines 328-330)', () => {
      expect(formatSecondsToTime(3600)).toBe('1:00:00'); // 1 hour
      expect(formatSecondsToTime(3661)).toBe('1:01:01'); // 1 hour, 1 minute, 1 second
      expect(formatSecondsToTime(7323)).toBe('2:02:03'); // 2 hours, 2 minutes, 3 seconds
      expect(formatSecondsToTime(7200)).toBe('2:00:00'); // 2 hours exactly
    });

    test('timeStringToSeconds converts time strings to seconds correctly', () => {
      expect(timeStringToSeconds('00:00')).toBe(0);
      expect(timeStringToSeconds('01:05')).toBe(65);
      expect(timeStringToSeconds('05:00')).toBe(300);
      expect(timeStringToSeconds('1:02:03')).toBe(3723);
      // Invalid format should fall back to 0
      expect(timeStringToSeconds('invalid')).toBe(0);
    });

    test('timeStringToMinutes converts HH:MM:SS format correctly (covers line 104)', () => {
      const { timeStringToMinutes } = require('./helper');
      expect(timeStringToMinutes('1:02:03')).toBe(62.05); // 1 hour + 2 minutes + 3 seconds = 62.05 minutes
      expect(timeStringToMinutes('0:05:30')).toBe(5.5); // 5 minutes + 30 seconds = 5.5 minutes
      expect(timeStringToMinutes('2:00:00')).toBe(120); // 2 hours = 120 minutes
    });

    test('timeStringToMinutes throws error for invalid format (covers line 108)', () => {
      const { timeStringToMinutes } = require('./helper');
      expect(() => timeStringToMinutes('invalid')).toThrow(
        'Invalid time format. Use MM:SS or HH:MM:SS'
      );
      expect(() => timeStringToMinutes('5')).toThrow(
        'Invalid time format. Use MM:SS or HH:MM:SS'
      );
      expect(() => timeStringToMinutes('')).toThrow(
        'Invalid time format. Use MM:SS or HH:MM:SS'
      );
    });

    test('secondsToTimeString converts seconds to time strings correctly', () => {
      expect(secondsToTimeString(0)).toBe('00:00');
      expect(secondsToTimeString(-10)).toBe('00:00');
      expect(secondsToTimeString(65)).toBe('01:05');
      expect(secondsToTimeString(300)).toBe('05:00');
      expect(secondsToTimeString(3723)).toBe('01:02:03'); // Hours now have leading zero padding
    });

    test('calculates percentages safely', () => {
      expect(calculatePercentage(5, 10)).toBe(50);
      expect(calculatePercentage(0, 10)).toBe(0);
      expect(calculatePercentage(5, 0)).toBe(0);
    });

    test('returns resource names from paths (no-op since helper no longer exports it)', () => {});

    test('maps performance stats to card data (STATUS_AWAY -> offline, no call time)', () => {
      const cardData = mapPerformanceStatsToCards([
        {
          user: 'users/abc',
          team: 'teams/xyz',
          userFullName: '',
          presence: { status: 'STATUS_AWAY' },
          hourlyStats: {
            callAttempts: 10,
            callsSuccessful: 5,
            talkTimeSeconds: 300,
            averageTimePerSuccessfulCallSeconds: 60,
            followupsAttempts: 4,
            followupsSuccessful: 2,
          },
          numberOfFollowUpsSet: 3,
          numberOfLeadsRejected: 1,
          numberOfLeadsPendingPayment: 2,
          numberOfLeadsContacted: 6,
          numberOfLeadsInTank: 7,
          numberOfLeadsNoAnswer: 0,
          numberOfLeadsInterested: 4,
        },
      ]);

      expect(cardData[0]).toMatchObject({
        userId: 'users/abc',
        userName: '',
        callTime: '00:00',
        totalCalls: 10,
        callsSuccessful: 5,
        talkTimeSeconds: '05:00',
        averageTimePerSuccessfulCallSeconds: '01:00',
        numberOfLeadsInTank: 7,
        followupsAttemptsLastHour: 4,
        followupsSuccessRate: 50,
        numberOfLeadsNoAnswer: 0,
        numberOfLeadsRejected: 1,
        numberOfLeadsContacted: 6,
        numberOfFollowUpsSet: 3,
        numberOfLeadsPendingPayment: 2,
        status: 'offline',
        followupsAttempts: 4,
        followupsSuccessful: 2,
      });
    });

    test('maps performance stats to card data (STATUS_CALL -> oncall with active call time)', () => {
      // Freeze time to make diffWithNow deterministic
      const fixedNow = new Date('2025-01-01T00:10:00Z');
      jest.useFakeTimers().setSystemTime(fixedNow);

      const cardData = mapPerformanceStatsToCards([
        {
          user: 'users/def',
          team: 'teams/xyz',
          userFullName: 'Agent On Call',
          presence: {
            status: 'STATUS_CALL',
            interactTime: '2025-01-01T00:05:00Z',
          },
          hourlyStats: {
            callAttempts: 20,
            callsSuccessful: 8,
            talkTimeSeconds: 600,
            averageTimePerSuccessfulCallSeconds: 75,
            followupsAttempts: 6,
            followupsSuccessful: 3,
          },
          activeCall: {
            call: 'calls/123',
            lead: 'leads/456',
            startTime: '2025-01-01T00:00:00Z',
          },
          numberOfFollowUpsSet: 2,
          numberOfLeadsRejected: 1,
          numberOfLeadsPendingPayment: 1,
          numberOfLeadsContacted: 4,
          numberOfLeadsInTank: 10,
          numberOfLeadsNoAnswer: 1,
          numberOfLeadsInterested: 2,
        },
      ]);

      // 10 minutes difference between startTime and fixedNow → "10:00"
      expect(cardData[0].callTime).toBe('10:00');
      expect(cardData[0].status).toBe('oncall');
      expect(cardData[0]).toMatchObject({
        totalCalls: 20,
        callsSuccessful: 8,
        numberOfLeadsInTank: 10,
        followupsAttemptsLastHour: 6,
        followupsSuccessRate: 50,
        numberOfLeadsNoAnswer: 1,
        numberOfLeadsRejected: 1,
        numberOfLeadsContacted: 4,
        numberOfFollowUpsSet: 2,
        numberOfLeadsPendingPayment: 1,
        followupsAttempts: 6,
        followupsSuccessful: 3,
      });

      jest.useRealTimers();
    });

    test('maps performance stats to card data (STATUS_ONLINE -> idle-yellow with interactTime)', () => {
      // Freeze time to make diffWithNow deterministic
      const fixedNow = new Date('2025-01-01T00:15:00Z');
      jest.useFakeTimers().setSystemTime(fixedNow);

      const cardData = mapPerformanceStatsToCards([
        {
          user: 'users/online-user',
          team: 'teams/xyz',
          userFullName: 'Online Agent',
          presence: {
            status: 'STATUS_ONLINE',
            interactTime: '2025-01-01T00:05:00Z',
          },
          hourlyStats: {
            callAttempts: 15,
            callsSuccessful: 7,
            talkTimeSeconds: 450,
            averageTimePerSuccessfulCallSeconds: 64,
            followupsAttempts: 5,
            followupsSuccessful: 2,
          },
          numberOfFollowUpsSet: 1,
          numberOfLeadsRejected: 0,
          numberOfLeadsPendingPayment: 1,
          numberOfLeadsContacted: 3,
          numberOfLeadsInTank: 8,
          numberOfLeadsNoAnswer: 2,
          numberOfLeadsInterested: 1,
        },
      ]);

      // 10 minutes difference between interactTime and fixedNow → "10:00"
      expect(cardData[0].callTime).toBe('10:00');
      expect(cardData[0].status).toBe('idle-yellow');
      expect(cardData[0]).toMatchObject({
        userId: 'users/online-user',
        userName: 'Online Agent',
        totalCalls: 15,
        callsSuccessful: 7,
        numberOfLeadsInTank: 8,
        followupsAttemptsLastHour: 5,
        followupsSuccessRate: 40,
        numberOfLeadsNoAnswer: 2,
        numberOfLeadsRejected: 0,
        numberOfLeadsContacted: 3,
        numberOfFollowUpsSet: 1,
        numberOfLeadsPendingPayment: 1,
        followupsAttempts: 5,
        followupsSuccessful: 2,
      });

      jest.useRealTimers();
    });

    test('maps performance stats to card data (STATUS_ONLINE with undefined interactTime)', () => {
      const fixedNow = new Date('2025-01-01T00:15:00Z');
      jest.useFakeTimers().setSystemTime(fixedNow);

      const cardData = mapPerformanceStatsToCards([
        {
          user: 'users/online-user-no-interact',
          team: 'teams/xyz',
          userFullName: 'Online Agent No Interact',
          presence: {
            status: 'STATUS_ONLINE',
            // interactTime is undefined
          },
          hourlyStats: {
            callAttempts: 10,
            callsSuccessful: 5,
            talkTimeSeconds: 300,
            averageTimePerSuccessfulCallSeconds: 60,
            followupsAttempts: 3,
            followupsSuccessful: 1,
          },
          numberOfFollowUpsSet: 0,
          numberOfLeadsRejected: 0,
          numberOfLeadsPendingPayment: 0,
          numberOfLeadsContacted: 2,
          numberOfLeadsInTank: 5,
          numberOfLeadsNoAnswer: 1,
          numberOfLeadsInterested: 0,
        },
      ]);

      // When interactTime is undefined, diffWithNow('') returns '00:00'
      expect(cardData[0].callTime).toBe('00:00');
      expect(cardData[0].status).toBe('idle-yellow');

      jest.useRealTimers();
    });

    test('maps performance stats to card data (STATUS_ONLINE overrides activeCall.startTime)', () => {
      // Freeze time to make diffWithNow deterministic
      const fixedNow = new Date('2025-01-01T00:20:00Z');
      jest.useFakeTimers().setSystemTime(fixedNow);

      const cardData = mapPerformanceStatsToCards([
        {
          user: 'users/online-with-active-call',
          team: 'teams/xyz',
          userFullName: 'Online Agent With Active Call',
          presence: {
            status: 'STATUS_ONLINE',
            interactTime: '2025-01-01T00:10:00Z', // 10 minutes ago
          },
          activeCall: {
            call: 'calls/789',
            lead: 'leads/012',
            startTime: '2025-01-01T00:00:00Z', // 20 minutes ago - should be overridden
          },
          hourlyStats: {
            callAttempts: 12,
            callsSuccessful: 6,
            talkTimeSeconds: 360,
            averageTimePerSuccessfulCallSeconds: 60,
            followupsAttempts: 4,
            followupsSuccessful: 2,
          },
          numberOfFollowUpsSet: 2,
          numberOfLeadsRejected: 1,
          numberOfLeadsPendingPayment: 1,
          numberOfLeadsContacted: 4,
          numberOfLeadsInTank: 6,
          numberOfLeadsNoAnswer: 1,
          numberOfLeadsInterested: 2,
        },
      ]);

      // Should use interactTime (10:00) not activeCall.startTime (20:00)
      expect(cardData[0].callTime).toBe('10:00');
      expect(cardData[0].status).toBe('idle-yellow');

      jest.useRealTimers();
    });

    test('diffWithNow handles invalid ISO string (covers line 347)', () => {
      const fixedNow = new Date('2025-01-01T00:00:00Z');
      jest.useFakeTimers().setSystemTime(fixedNow);

      const cardData = mapPerformanceStatsToCards([
        {
          user: 'users/test',
          team: 'teams/xyz',
          userFullName: 'Test User',
          presence: { status: 'STATUS_CALL' },
          hourlyStats: {
            callAttempts: 10,
            callsSuccessful: 5,
            talkTimeSeconds: 300,
            averageTimePerSuccessfulCallSeconds: 60,
            followupsAttempts: 3,
            followupsSuccessful: 1,
          },
          activeCall: {
            call: 'calls/123',
            lead: 'leads/456',
            startTime: 'invalid-date-string', // Invalid date
          },
          numberOfFollowUpsSet: 0,
          numberOfLeadsRejected: 0,
          numberOfLeadsPendingPayment: 0,
          numberOfLeadsContacted: 0,
          numberOfLeadsInTank: 0,
          numberOfLeadsNoAnswer: 0,
          numberOfLeadsInterested: 0,
        },
      ]);

      // Should return '00:00' for invalid date
      expect(cardData[0].callTime).toBe('00:00');

      jest.useRealTimers();
    });

    test('diffWithNow handles date parsing error (covers line 357)', () => {
      const fixedNow = new Date('2025-01-01T00:00:00Z');
      jest.useFakeTimers().setSystemTime(fixedNow);

      // Mock the Date constructor to throw an error when called with a string
      const OriginalDate = global.Date;
      let callCount = 0;

      // Create a function that throws on first call with string argument
      const MockDate = function (...args: any[]) {
        callCount++;
        // When called with a string argument (the startTime), throw an error
        if (callCount === 1 && args.length > 0 && typeof args[0] === 'string') {
          throw new Error('Date parsing error');
        }
        // For other calls (like new Date() for 'now'), use original Date
        return new OriginalDate(...args);
      } as any;

      // Copy static methods
      MockDate.now = OriginalDate.now;
      MockDate.parse = OriginalDate.parse;
      MockDate.UTC = OriginalDate.UTC;

      // Replace global Date AFTER setting up fake timers
      global.Date = MockDate;

      const cardData = mapPerformanceStatsToCards([
        {
          user: 'users/test',
          team: 'teams/xyz',
          userFullName: 'Test User',
          presence: { status: 'STATUS_CALL' },
          hourlyStats: {
            callAttempts: 10,
            callsSuccessful: 5,
            talkTimeSeconds: 300,
            averageTimePerSuccessfulCallSeconds: 60,
            followupsAttempts: 3,
            followupsSuccessful: 1,
          },
          activeCall: {
            call: 'calls/123',
            lead: 'leads/456',
            startTime: '2025-01-01T00:00:00Z',
          },
          numberOfFollowUpsSet: 0,
          numberOfLeadsRejected: 0,
          numberOfLeadsPendingPayment: 0,
          numberOfLeadsContacted: 0,
          numberOfLeadsInTank: 0,
          numberOfLeadsNoAnswer: 0,
          numberOfLeadsInterested: 0,
        },
      ]);

      // Should return '00:00' when date parsing throws error
      expect(cardData[0].callTime).toBe('00:00');

      // Restore Date
      global.Date = OriginalDate;
      jest.useRealTimers();
    });

    test('maps performance stats with STATUS_IDLE statuses', () => {
      expect(mapPresenceStatusToCardStatus('STATUS_IDLE')).toBe('idle-yellow');
      expect(mapPresenceStatusToCardStatus('STATUS_IDLE_RED')).toBe('idle-red');
      expect(mapPresenceStatusToCardStatus('STATUS_IDLE_YELLOW')).toBe(
        'idle-yellow'
      );
      expect(mapPresenceStatusToCardStatus('STATUS_IDLE_GREEN')).toBe(
        'idle-green'
      );
    });
  });

  describe('RenderSkeletonCards', () => {
    test('renders 5 skeleton cards with correct structure', () => {
      const { container } = render(<RenderSkeletonCards />);
      const skeletons = container.querySelectorAll(
        '[data-testid="performance-statistic-skeleton"]'
      );

      expect(skeletons).toHaveLength(5);

      skeletons.forEach((skeleton) => {
        expect(skeleton).toHaveClass('animate-pulse');
        expect(skeleton).toHaveClass('bg-gray-100');
        expect(skeleton).toHaveClass('rounded-2xl');
        expect(skeleton).toHaveClass('p-4');
        expect(skeleton).toHaveClass('flex');
        expect(skeleton).toHaveClass('flex-col');
        expect(skeleton).toHaveClass('gap-2');
        expect(skeleton).toHaveClass('w-[278px]');
        expect(skeleton).toHaveClass('h-48');
      });
    });

    test('skeleton cards are div elements', () => {
      const { container } = render(<RenderSkeletonCards />);
      const skeletons = container.querySelectorAll(
        '[data-testid="performance-statistic-skeleton"]'
      );

      skeletons.forEach((skeleton) => {
        expect(skeleton.tagName).toBe('DIV');
      });
    });
  });

  describe('value-based background color functions', () => {
    test('getBackgroundTotalCallsbyValue returns correct colors', () => {
      expect(getBackgroundTotalCallsbyValue(20)).toBe(
        'bg-[#2FCE82] text-white'
      ); // Green: > 15
      expect(getBackgroundTotalCallsbyValue(12)).toBe(
        'bg-[#F78F1E] text-white'
      ); // Orange: 10-15
      expect(getBackgroundTotalCallsbyValue(5)).toBe('bg-[#EA4548] text-white'); // Red: < 10
    });

    test('getBackgroundOutgoingRatebyValue returns correct colors', () => {
      expect(getBackgroundOutgoingRatebyValue(10)).toBe(
        'bg-[#2FCE82] text-white'
      ); // Green: > 7
      expect(getBackgroundOutgoingRatebyValue(6)).toBe(
        'bg-[#F78F1E] text-white'
      ); // Orange: 5-7
      expect(getBackgroundOutgoingRatebyValue(3)).toBe(
        'bg-[#EA4548] text-white'
      ); // Red: < 5
    });

    test('getBackgroundAvgCallTimebyValue returns correct colors', () => {
      expect(getBackgroundAvgCallTimebyValue('08:00')).toBe(
        'bg-[#2FCE82] text-white'
      ); // Green: 7-10
      expect(getBackgroundAvgCallTimebyValue('06:00')).toBe(
        'bg-[#F78F1E] text-white'
      ); // Orange: 5-7
      expect(getBackgroundAvgCallTimebyValue('12:00')).toBe(
        'bg-[#F78F1E] text-white'
      ); // Orange: 10-15
      expect(getBackgroundAvgCallTimebyValue('03:00')).toBe(
        'bg-[#EA4548] text-white'
      ); // Red: < 5
      expect(getBackgroundAvgCallTimebyValue('20:00')).toBe(
        'bg-[#EA4548] text-white'
      ); // Red: > 15
    });

    test('getBackgroundTalkTimebyValue returns correct colors', () => {
      expect(getBackgroundTalkTimebyValue('45:00')).toBe(
        'bg-[#2FCE82] text-white'
      ); // Green: > 40
      expect(getBackgroundTalkTimebyValue('35:00')).toBe(
        'bg-[#F78F1E] text-white'
      ); // Orange: 30-40
      expect(getBackgroundTalkTimebyValue('20:00')).toBe(
        'bg-[#EA4548] text-white'
      ); // Red: < 30
    });

    test('getBackgroundLeadsInTankbyValue returns correct colors', () => {
      expect(getBackgroundLeadsInTankbyValue(35)).toBe(
        'bg-[#2FCE82] text-white'
      ); // Green: 30-40
      expect(getBackgroundLeadsInTankbyValue(27)).toBe(
        'bg-[#F78F1E] text-white'
      ); // Orange: 25-30
      expect(getBackgroundLeadsInTankbyValue(45)).toBe(
        'bg-[#F78F1E] text-white'
      ); // Orange: 40-50
      expect(getBackgroundLeadsInTankbyValue(20)).toBe(
        'bg-[#EA4548] text-white'
      ); // Red: < 25
      expect(getBackgroundLeadsInTankbyValue(55)).toBe(
        'bg-[#EA4548] text-white'
      ); // Red: > 50
    });

    test('getBackgroundFollowUpAttemptsbyValue returns correct colors', () => {
      expect(getBackgroundFollowUpAttemptsbyValue(10, 10)).toBe(
        'bg-[#2FCE82] text-white'
      ); // Green: 100%
      expect(getBackgroundFollowUpAttemptsbyValue(0, 0)).toBe(
        'bg-[#f7f7f7] text-slate-300 opacity-80'
      ); // Orange: No attempts
      expect(getBackgroundFollowUpAttemptsbyValue(10, 8)).toBe(
        'bg-[#EA4548] text-white'
      ); // Red: Not 100%
    });

    test('getBackgroundSuccessfulFollowupsbyValue returns correct colors', () => {
      expect(getBackgroundSuccessfulFollowupsbyValue(80)).toBe(
        'bg-[#2FCE82] text-white'
      ); // Green: > 70%
      expect(getBackgroundSuccessfulFollowupsbyValue(60)).toBe(
        'bg-[#F78F1E] text-white'
      ); // Orange: 50-70%
      expect(getBackgroundSuccessfulFollowupsbyValue(30)).toBe(
        'bg-[#EA4548] text-white'
      ); // Red: < 50%
    });

    test('getBackgroundSuccessfulFollowupsbyValue returns gray for 0% (covers line 265)', () => {
      expect(getBackgroundSuccessfulFollowupsbyValue(0)).toBe(
        'bg-[#f7f7f7] text-slate-300 opacity-80'
      );
    });
  });

  describe('getTeamIdFromMember', () => {
    test('returns null when memberName is undefined (covers line 164)', () => {
      expect(getTeamIdFromMember(undefined)).toBeNull();
    });

    test('returns null when memberName is null (covers line 164)', () => {
      expect(getTeamIdFromMember(null as any)).toBeNull();
    });

    test('returns null when memberName is empty string (covers line 164)', () => {
      expect(getTeamIdFromMember('')).toBeNull();
    });

    test('returns null when memberName does not contain /members (covers line 166)', () => {
      expect(getTeamIdFromMember('teams/team-id')).toBeNull();
    });

    test('returns null when /members is at the start (covers line 166)', () => {
      expect(getTeamIdFromMember('/members/member-id')).toBeNull();
    });

    test('returns team ID when memberName has valid format', () => {
      expect(
        getTeamIdFromMember('teams/supervisor-team-id/members/member-id')
      ).toBe('teams/supervisor-team-id');
    });

    test('returns team ID for different team formats', () => {
      expect(getTeamIdFromMember('teams/abc123/members/xyz789')).toBe(
        'teams/abc123'
      );
    });
  });
});
