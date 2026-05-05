export interface PresenceInfo {
  updateTime?: string | null;
  status?: string;
  interactTime?: string;
  awayReason?: string;
}

export interface HourlyStats {
  callAttempts?: number;
  callsSuccessful?: number;
  talkTimeSeconds?: number;
  averageTimePerSuccessfulCallSeconds?: number;
  followupsAttempts?: number;
  followupsSuccessful?: number;
  numberOfOrdersCreated?: number;
}

export interface ActiveCall {
  call: string;
  lead: string;
  startTime: string;
  leadHumanId?: string;
}

export interface PerformanceStat {
  userFullName: string;
  user: string;
  team?: string;
  presence?: PresenceInfo;
  numberOfLeadsInTank?: number;
  hourlyStats?: HourlyStats;
  numberOfLeadsRejected?: number;
  numberOfLeadsContacted?: number;
  numberOfLeadsNoAnswer?: number;
  numberOfFollowUpsSet?: number;
  numberOfLeadsPendingPayment?: number;
  numberOfLeadsInterested?: number;
  activeCall?: ActiveCall;
}

export interface PerformanceStatsResponse {
  stats: PerformanceStat[];
  nextPageToken?: string;
}

export interface PerformanceStatFilters {
  status?: string[];
  team?: string[];
  user?: string[];
  filter?: string;
  poll?: number;
  /** '1h' = last hour (today only), 'day' = full day / day-so-far */
  interval?: '1h' | 'day';
  /** ISO date string yyyy-MM-dd; empty / undefined means today */
  date?: string;
}
