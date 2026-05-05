import React from 'react';
import { getString } from 'presentation/theme/localization';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import Controls from 'presentation/components/controls/Control';
import { PhoneAltIcon, PhoneOfflineIcon, IdleIcon } from '@alphafounders/icons';
import {
  PerformanceStat,
  PerformanceStatFilters,
} from 'data/slices/performanceStatisticSlice/types';

export type Status =
  | 'oncall'
  | 'offline'
  | 'idle-red'
  | 'idle-yellow'
  | 'idle-green';

export type { PerformanceStatFilters };

export const COLORS = {
  green: '#2FCE82',
  gray: '#B0B0B0',
  red: '#EA4548',
  yellow: '#F78F1E',
};
export const getStatusOptions = () => [
  {
    key: 1,
    title: getString('performanceStatistic.statusOptions.statusCall'),
    value: 'STATUS_CALL',
    name: 'STATUS_CALL',
    displayName: getString('performanceStatistic.statusOptions.statusCall'),
  },
  {
    key: 2,
    title: getString('performanceStatistic.statusOptions.statusOnline'),
    value: 'STATUS_ONLINE',
    name: 'STATUS_ONLINE',
    displayName: getString('performanceStatistic.statusOptions.statusOnline'),
  },
  {
    key: 3,
    title: getString('performanceStatistic.statusOptions.statusAway'),
    value: 'STATUS_AWAY',
    name: 'STATUS_AWAY',
    displayName: getString('performanceStatistic.statusOptions.statusAway'),
  },
];

// Keep statusOptions for backward compatibility, but it will use default translations
export const statusOptions = getStatusOptions();
export const filterFields = (getTeams: () => void): IFilterFormField[] => [
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'status',
      label: getString('text.status'),
      placeholder: getString('text.select'),
      options: getStatusOptions(),
      labelField: 'title',
      valueField: 'value',
      multiple: true,
      hasSelectAll: true,
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'team',
      label: getString('text.team'),
      placeholder: getString('text.select'),
      labelField: 'displayName',
      valueField: 'name',
      async: false,
      onFocusFn: getTeams,
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 3,
      },
      hasSelectAll: true,
    },
  },
];
export const initialFilterValues: PerformanceStatFilters = {
  status: [],
  team: [],
  user: [],
  interval: '1h',
  date: '',
};
// Examples
// console.log(timeStringToMinutes("05:59"));       // 5.9833 minutes
export function timeStringToMinutes(timeStr: string): number {
  const parts = timeStr.split(':').map(Number);
  let hh = 0;
  let mm = 0;
  let ss = 0;
  if (parts.length === 3) {
    [hh, mm, ss] = parts;
  } else if (parts.length === 2) {
    [mm, ss] = parts;
  } else {
    throw new Error('Invalid time format. Use MM:SS or HH:MM:SS');
  }
  return hh * 60 + mm + ss / 60;
}

// Helper to convert time string (MM:SS or HH:MM:SS) to total seconds
export const timeStringToSeconds = (timeStr: string): number => {
  if (!timeStr || timeStr === '00:00') return 0;
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

export const shortenName = (name: string, limit: number = 24): string =>
  name.length > limit ? `${name.slice(0, limit)}...` : name;

// Helper to convert total seconds to time string (MM:SS or HH:MM:SS)
export const secondsToTimeString = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

export const calculatePercentage = (value?: number, total?: number): number => {
  if (!value || !total || total <= 0) {
    return 0;
  }
  return Math.round((value / total) * 100);
};
export const getColorByStatus = (status: Status, callTime?: string) => {
  switch (status) {
    case 'oncall':
      return 'bg-[#2FCE82]';
    case 'offline':
      return 'bg-[#B0B0B0]';
    case 'idle-red':
      return 'bg-[#EA4548]';
    case 'idle-yellow': {
      if (!callTime || callTime === '00:00' || callTime === '') {
        return 'bg-[#F78F1E]';
      }
      try {
        const minutes = timeStringToMinutes(callTime);
        if (minutes < 5) return 'bg-[#2FCE82]';
        if (minutes <= 10) return 'bg-[#F78F1E]';
        return 'bg-[#EA4548]';
      } catch {
        return 'bg-[#F78F1E]';
      }
    }
    case 'idle-green':
      return 'bg-[#2FCE82]';
    default:
      return 'bg-[#2FCE82]';
  }
};
export const getIconByStatus = (status: Status) => {
  switch (status) {
    case 'oncall':
      return <PhoneAltIcon className="w-5 h-5" fillColor="#ffffff" />;
    case 'offline':
      return <PhoneOfflineIcon className="w-5.5 h-5.5" fillColor="#ffffff" />;
    case 'idle-red':
      return <IdleIcon className="w-5 h-5" fillColor="#ffffff" />;
    case 'idle-yellow':
      return <IdleIcon className="w-5 h-5" fillColor="#ffffff" />;
    case 'idle-green':
      return <IdleIcon className="w-5 h-5" fillColor="#ffffff" />;
    default:
      return <PhoneAltIcon className="w-5 h-5" fillColor="#ffffff" />;
  }
};
export const getBackgroundTotalCallsbyValue = (callAttempts: number) => {
  if (callAttempts > 15) {
    return 'bg-[#2FCE82] text-white';
  }
  if (callAttempts >= 10 && callAttempts <= 15) {
    return 'bg-[#F78F1E] text-white';
  }
  return 'bg-[#EA4548] text-white';
};
export const getBackgroundOutgoingRatebyValue = (callsSuccessful: number) => {
  if (callsSuccessful > 7) {
    return 'bg-[#2FCE82] text-white';
  }
  if (callsSuccessful >= 5 && callsSuccessful <= 7) {
    return 'bg-[#F78F1E] text-white';
  }
  return 'bg-[#EA4548] text-white';
};
export const getBackgroundAvgCallTimebyValue = (avgCallTimeStr: string) => {
  const avgMinutes = timeStringToMinutes(avgCallTimeStr);
  if (avgMinutes >= 7 && avgMinutes <= 10) {
    return 'bg-[#2FCE82] text-white';
  }
  if (
    (avgMinutes >= 5 && avgMinutes < 7) ||
    (avgMinutes > 10 && avgMinutes <= 15)
  ) {
    return 'bg-[#F78F1E] text-white';
  }
  return 'bg-[#EA4548] text-white';
};
export const getBackgroundTalkTimebyValue = (talkTimeStr: string) => {
  const talkMinutes = timeStringToMinutes(talkTimeStr);
  if (talkMinutes > 40) {
    return 'bg-[#2FCE82] text-white';
  }
  if (talkMinutes >= 30 && talkMinutes <= 40) {
    return 'bg-[#F78F1E] text-white';
  }
  return 'bg-[#EA4548] text-white';
};
export const getBackgroundLeadsInTankbyValue = (leadsInTank?: number) => {
  const value = leadsInTank ?? 0;
  if (value >= 30 && value <= 40) {
    return 'bg-[#2FCE82] text-white';
  }
  if ((value >= 25 && value < 30) || (value > 40 && value <= 50)) {
    return 'bg-[#F78F1E] text-white';
  }
  return 'bg-[#EA4548] text-white';
};
export const getBackgroundFollowUpAttemptsbyValue = (
  followupsAttempts: number,
  followupsSuccessful: number
) => {
  if (followupsAttempts === 0) {
    return 'bg-[#f7f7f7] text-slate-300 opacity-80'; // No attempts scheduled
  }
  const successRate = calculatePercentage(
    followupsSuccessful,
    followupsAttempts
  );
  if (successRate === 100) {
    return 'bg-[#2FCE82] text-white';
  }
  return 'bg-[#EA4548] text-white'; // Has attempts but not 100%
};
export const getBackgroundSuccessfulFollowupsbyValue = (
  successRate: number
) => {
  if (successRate === 0) {
    return 'bg-[#f7f7f7] text-slate-300 opacity-80';
  }
  if (successRate > 70) {
    return 'bg-[#2FCE82] text-white';
  }
  if (successRate >= 50 && successRate <= 70) {
    return 'bg-[#F78F1E] text-white';
  }
  return 'bg-[#EA4548] text-white';
};

// Extract team ID from team member resource name
// Format: "teams/{teamId}/members/{memberId}"
export const getTeamIdFromMember = (memberName?: string): string | null => {
  if (!memberName) return null;
  const membersIndex = memberName.indexOf('/members');
  return membersIndex > 0 ? memberName.substring(0, membersIndex) : null;
};
const PRESENCE_STATUS_MAP: Record<string, Status> = {
  STATUS_CALL: 'oncall',
  STATUS_ONLINE: 'idle-yellow', // STATUS_ONLINE means idle
  STATUS_IDLE: 'idle-yellow', // Default idle to green
  STATUS_IDLE_RED: 'idle-red',
  STATUS_IDLE_YELLOW: 'idle-yellow',
  STATUS_IDLE_GREEN: 'idle-green',
  STATUS_OFFLINE: 'offline',
  STATUS_AWAY: 'offline',
};

export interface PerformanceCardData {
  userId: string;
  userName: string;
  callTime: string;
  totalCalls: number;
  callsSuccessful: number;
  talkTimeSeconds: string;
  averageTimePerSuccessfulCallSeconds: string;
  numberOfLeadsInTank: number;
  followupsAttemptsLastHour: number;
  followupsSuccessRate: number;
  numberOfLeadsNoAnswer: number;
  numberOfLeadsRejected: number;
  numberOfLeadsContacted: number;
  numberOfFollowUpsSet: number;
  numberOfLeadsPendingPayment: number;
  numberOfOrdersCreated: number;
  status: Status;
  followupsAttempts: number;
  followupsSuccessful: number;
  activeCallId: string;
  leadId: string;
  leadHumanId: string;
}

export const mapPresenceStatusToCardStatus = (
  presenceStatus?: string
): Status => PRESENCE_STATUS_MAP[presenceStatus ?? ''] ?? 'oncall';

export const formatSecondsToTime = (seconds?: number) => {
  if (!seconds || seconds <= 0) {
    return '00:00';
  }
  const totalMinutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }
  return `${totalMinutes.toString().padStart(2, '0')}:${remainingSeconds
    .toString()
    .padStart(2, '0')}`;
};

function diffWithNow(isoString: string) {
  if (!isoString || isoString === '') {
    return '00:00';
  }
  try {
    const given = new Date(isoString);
    const now = new Date();
    if (Number.isNaN(given.getTime())) {
      return '00:00';
    }
    let diff = Math.abs(now.getTime() - given.getTime()) / 1000; // seconds
    const hh = String(Math.floor(diff / 3600)).padStart(2, '0');
    diff %= 3600;
    const mm = String(Math.floor(diff / 60)).padStart(2, '0');
    const ss = String(Math.floor(diff % 60)).padStart(2, '0');
    const result = `${hh}:${mm}:${ss}`;
    return result.startsWith('00:') ? result.replace('00:', '') : result;
  } catch {
    return '00:00';
  }
}
export const mapPerformanceStatsToCards = (
  stats: PerformanceStat[] = []
): PerformanceCardData[] =>
  stats.map((stat) => {
    const {
      hourlyStats,
      numberOfFollowUpsSet,
      numberOfLeadsRejected,
      numberOfLeadsPendingPayment,
      numberOfLeadsContacted,
      numberOfLeadsInTank,
      numberOfLeadsNoAnswer,
      activeCall,
    } = stat;
    const callAttempts = hourlyStats?.callAttempts ?? 0;
    const callsSuccessful = hourlyStats?.callsSuccessful ?? 0;
    const followupsAttempts = hourlyStats?.followupsAttempts ?? 0;
    const followupsSuccessful = hourlyStats?.followupsSuccessful ?? 0;
    const numberOfOrdersCreated = hourlyStats?.numberOfOrdersCreated ?? 0;
    const status = mapPresenceStatusToCardStatus(stat.presence?.status);
    const realStatus = stat.presence?.status;
    let callDurationOrIdleTime = '00:00';
    if (activeCall?.startTime) {
      callDurationOrIdleTime = diffWithNow(activeCall?.startTime ?? '');
    }
    if (realStatus === 'STATUS_ONLINE') {
      callDurationOrIdleTime = diffWithNow(stat.presence?.interactTime ?? '');
    }
    return {
      userId: stat.user ?? '',
      userName: stat.userFullName ?? '',
      callTime: callDurationOrIdleTime,
      totalCalls: callAttempts,
      callsSuccessful,
      talkTimeSeconds: formatSecondsToTime(hourlyStats?.talkTimeSeconds),
      averageTimePerSuccessfulCallSeconds: formatSecondsToTime(
        hourlyStats?.averageTimePerSuccessfulCallSeconds
      ),
      numberOfLeadsInTank: numberOfLeadsInTank ?? 0,
      followupsAttemptsLastHour: followupsAttempts,
      followupsSuccessRate: calculatePercentage(
        followupsSuccessful,
        followupsAttempts
      ),
      numberOfLeadsNoAnswer: numberOfLeadsNoAnswer ?? 0,
      numberOfLeadsRejected: numberOfLeadsRejected ?? 0,
      numberOfLeadsContacted: numberOfLeadsContacted ?? 0,
      numberOfFollowUpsSet: numberOfFollowUpsSet ?? 0,
      numberOfLeadsPendingPayment: numberOfLeadsPendingPayment ?? 0,
      numberOfOrdersCreated,
      status,
      followupsAttempts,
      followupsSuccessful,
      activeCallId: activeCall?.call ?? '',
      leadId: activeCall?.lead ?? '',
      leadHumanId: activeCall?.leadHumanId ?? '',
    };
  });

export const RenderSkeletonCards = () =>
  [1, 2, 3, 4, 5].map((item) => (
    <div
      key={item}
      className="animate-pulse bg-gray-100 rounded-2xl p-4 flex flex-col gap-2 w-[278px] h-48 mb-1 mr-1"
      data-testid="performance-statistic-skeleton"
    />
  ));

export const POLLING_INTERVAL = 5000;
export const POLLING_INTERVAL_INFINITE_SCROLL = 600;

export const isOnCallOrIdle = (status?: Status) =>
  status === 'oncall' ||
  status === 'idle-yellow' ||
  status === 'idle-red' ||
  status === 'idle-green';

export const handleKeyActivate = (
  e: React.KeyboardEvent,
  callback: () => void
) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    callback();
  }
};

export const formatWithLeadingZero = (value?: number) =>
  value && value < 10 ? `0${value}` : value?.toString();
