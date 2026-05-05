import {
  AlertCircleIcon,
  ArrowUpWideIcon,
  CheckCircleIconAlt,
  CoinsIcon,
  FileTextIcon,
  MessageSquareOffIcon,
  MessagesSquareIcon,
  OrdersCreatedIcon,
  PhoneClockIcon,
  PhoneOutgoingIcon,
  PhoneSmallIcon,
  TrendingUpIcon,
  UploadArrowIcon,
} from '@alphafounders/icons';
import { Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { PRODUCTS } from 'config/TypeFilter';
import FeatureFlags from 'config/flagsmithConfig';
import { useFlags } from 'flagsmith/react';
import { PushPinIcon } from 'presentation/components/icons';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';
import { getString } from 'presentation/theme/localization';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  formatWithLeadingZero,
  getBackgroundAvgCallTimebyValue,
  getBackgroundFollowUpAttemptsbyValue,
  getBackgroundLeadsInTankbyValue,
  getBackgroundOutgoingRatebyValue,
  getBackgroundSuccessfulFollowupsbyValue,
  getBackgroundTalkTimebyValue,
  getBackgroundTotalCallsbyValue,
  getColorByStatus,
  getIconByStatus,
  handleKeyActivate,
  isOnCallOrIdle,
  secondsToTimeString,
  shortenName,
  Status,
  timeStringToSeconds,
} from '../helper';

interface CallStatsCardProps {
  openPopupAudioRender: (open: boolean) => void;
  nowTick?: number;
  userId: string;
  userName: string;
  callTime: string;
  totalCalls?: number;
  callsSuccessful?: number;
  talkTimeSeconds?: string;
  averageTimePerSuccessfulCallSeconds?: string;
  followupsAttemptsLastHour?: number;
  followupsSuccessRate?: number;
  numberOfLeadsNoAnswer?: number;
  numberOfLeadsRejected?: number;
  numberOfLeadsContacted?: number;
  numberOfFollowUpsSet?: number;
  numberOfLeadsPendingPayment?: number;
  numberOfLeadsInTank?: number;
  status?: Status;
  // Raw values for color calculation
  followupsAttempts?: number;
  followupsSuccessful?: number;
  leadId: string;
  leadHumanId: string;
  activeCallId: string;
  handleLiveListen: (
    activeCallId: string,
    userName: string,
    leadId: string,
    callTime: string
  ) => void;
  numberOfOrdersCreated?: number;
  isWatched?: boolean;
  onToggleWatched?: (userId: string) => void;
  /** True when the grid is showing a past date's stats — presence is still live */
  isPastDate?: boolean;
}

function StatItem({
  icon,
  value,
  className,
  width,
}: Readonly<{
  icon: React.ReactNode;
  value: string | number | undefined;
  className?: string;
  width?: string;
}>) {
  return (
    <div
      className={clsx(
        'flex items-center gap-1 p-1',
        width || 'mr-2',
        className
      )}
    >
      <div className="w-4 h-4 flex items-center justify-center pt-1">
        {icon}
      </div>
      <div className="flex items-center justify-center text-medium font-normal">
        {value}
      </div>
    </div>
  );
}

function CallStatsCard({
  openPopupAudioRender: _openPopupAudioRender,
  nowTick,
  handleLiveListen,
  userId,
  userName,
  callTime,
  totalCalls,
  callsSuccessful,
  talkTimeSeconds,
  averageTimePerSuccessfulCallSeconds,
  followupsAttemptsLastHour,
  followupsSuccessRate,
  numberOfLeadsNoAnswer,
  numberOfLeadsRejected,
  numberOfLeadsContacted,
  numberOfFollowUpsSet,
  numberOfLeadsPendingPayment,
  numberOfLeadsInTank,
  status,
  followupsAttempts,
  followupsSuccessful,
  leadId,
  leadHumanId,
  activeCallId,
  numberOfOrdersCreated,
  isWatched = false,
  onToggleWatched,
  isPastDate = false,
}: Readonly<CallStatsCardProps>) {
  const featureFlags = useFlags([
    FeatureFlags.BROK_4290_ENABLE_DASHBOARD_PIN_FEATURE_TEMP,
  ]);
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );
  const isHealthProduct = globalProduct === PRODUCTS.HEALTH_PRODUCT_INSURANCE;
  const activeCallLeadHref = useMemo(() => {
    const path = (leadId ?? '').trim();
    if (!path) return '/leads';
    return `${isHealthProduct ? '/health/' : '/'}${path}`;
  }, [isHealthProduct, leadId]);
  const isDashboardPinFeatureEnabled =
    featureFlags[FeatureFlags.BROK_4290_ENABLE_DASHBOARD_PIN_FEATURE_TEMP]
      ?.enabled ?? false;

  const defaultIconColor = status === 'offline' ? '#005098' : '#ffffff';
  const onCallOrIdleStatus = isOnCallOrIdle(status);
  const callTimeSyncAtRef = useRef(Date.now());

  useEffect(() => {
    callTimeSyncAtRef.current = Date.now();
  }, [callTime]);

  const displayCallTime = useMemo(() => {
    const fallbackCallTime = callTime || '00:00';
    if (!onCallOrIdleStatus) {
      return fallbackCallTime;
    }

    const baselineSeconds = timeStringToSeconds(fallbackCallTime);
    const elapsedSeconds = Math.max(
      0,
      Math.floor(((nowTick ?? Date.now()) - callTimeSyncAtRef.current) / 1000)
    );

    return secondsToTimeString(baselineSeconds + elapsedSeconds);
  }, [callTime, onCallOrIdleStatus, nowTick]);

  const getStatusLabel = (agentStatus?: Status): string => {
    if (agentStatus === 'offline') {
      return getString('performanceStatistic.status.offline');
    }

    if (agentStatus === 'oncall') {
      return getString('performanceStatistic.status.onCall');
    }

    return getString('performanceStatistic.status.idle');
  };

  const statusLabel = getStatusLabel(status);
  const handleStatusIconClick = () => {
    handleLiveListen(activeCallId, userName, leadId, callTime);
  };

  const withActiveBackground = (bg: string) => (status === 'offline' ? '' : bg);

  return (
    <div className="relative">
      {status === 'offline' && (
        <div
          data-testid="offline-overlay"
          className="absolute z-10 opacity-50 w-[278px] h-[210px] bg-white rounded-2xl p-4 flex flex-col gap-4 shadow-sm"
        />
      )}
      <div
        className={clsx(
          'w-[278px] bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-sm h-[210px] mb-1 mr-1',
          status === 'offline' && 'opacity-80'
        )}
      >
        {isDashboardPinFeatureEnabled && onToggleWatched && (
          <Tooltip
            title={
              isWatched
                ? getString('performanceStatistic.removeFromWatched')
                : getString('performanceStatistic.addToWatched')
            }
          >
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatched(userId);
              }}
              onKeyDown={(e) =>
                handleKeyActivate(e, () => onToggleWatched(userId))
              }
              className="cursor-pointer drop-shadow-sm absolute -top-2 right-0 z-10 inline-flex items-center justify-center w-5 h-5"
              data-testid={`watch-button-${userId}`}
            >
              <div
                className={clsx(
                  'transition-colors duration-200',
                  isWatched ? 'text-[#FFBF00]' : 'text-gray-400'
                )}
              >
                <PushPinIcon
                  className="w-5 h-5 font-bold"
                  aria-label={isWatched ? 'Unpin' : 'Pin'}
                />
              </div>
            </span>
          </Tooltip>
        )}
        <div className="flex justify-between items-center pb-2 -mb-2 border-b-[1px] border-t-0 border-l-0 border-r-0 border-solid border-[#E5E5E5]">
          <div className="flex flex-col min-w-0">
            <div className="text-sm leading-5 text-black font-normal truncate">
              {shortenName(userName)}
            </div>
            <div className="text-[11px] leading-4 text-black font-semibold whitespace-nowrap">
              {status === 'oncall' ? (
                <>
                  {getString('performanceStatistic.status.onCall')}
                  {leadHumanId && (
                    <>
                      {' '}
                      <a
                        href={activeCallLeadHref}
                        className="underline hover:opacity-70"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {leadHumanId}
                      </a>
                    </>
                  )}
                </>
              ) : (
                statusLabel
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 -mr-2.5 shrink-0">
            <Tooltip
              title={
                isPastDate ? getString('performanceStatistic.liveTooltip') : ''
              }
            >
              <div className="relative">
                {isPastDate && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400 ring-1 ring-white animate-pulse z-10" />
                )}
                <div
                  role="button"
                  tabIndex={0}
                  className={clsx(
                    'w-[26px] h-[26px] rounded flex items-center justify-center',
                    getColorByStatus(status ?? 'oncall', displayCallTime),
                    [status === 'oncall' && 'cursor-pointer']
                  )}
                  onKeyDown={(e) => handleKeyActivate(e, handleStatusIconClick)}
                  onClick={handleStatusIconClick}
                >
                  {getIconByStatus(status ?? 'oncall')}
                </div>
              </div>
            </Tooltip>
            <Tooltip
              title={
                status === 'oncall'
                  ? getString('performanceStatistic.tooltips.callDuration')
                  : status !== 'offline'
                    ? getString('performanceStatistic.tooltips.totalIdleTime')
                    : ''
              }
            >
              <div className="text-xs leading-5 text-black min-w-10">
                {displayCallTime}
              </div>
            </Tooltip>
          </div>
        </div>

        <div className="w-full h-px bg-[#E5E5E5]" />

        <div className="flex flex-col gap-0">
          <div className="text-[11px] leading-4 text-[#CACACA]">
            {getString('performanceStatistic.sections.calls')}
          </div>
          <div className="flex items-center mt-1 gap-1.5 justify-between">
            <StatItem
              icon={
                <Tooltip
                  title={getString(
                    'performanceStatistic.tooltips.callAttemptsLastHour'
                  )}
                >
                  <span>
                    <PhoneSmallIcon
                      className="w-5 h-5"
                      fillColor={defaultIconColor}
                    />
                  </span>
                </Tooltip>
              }
              value={formatWithLeadingZero(totalCalls)}
              className={withActiveBackground(
                getBackgroundTotalCallsbyValue(totalCalls ?? 0)
              )}
            />
            <StatItem
              icon={
                <Tooltip
                  title={getString(
                    'performanceStatistic.tooltips.callSuccessLastHour'
                  )}
                >
                  <span>
                    <PhoneOutgoingIcon
                      className="w-[16px] h-[16px]"
                      fillColor={defaultIconColor}
                    />
                  </span>
                </Tooltip>
              }
              value={`${callsSuccessful && callsSuccessful < 10 ? '0' : ''}${callsSuccessful?.toString()}`}
              className={withActiveBackground(
                getBackgroundOutgoingRatebyValue(callsSuccessful ?? 0)
              )}
            />
            <StatItem
              icon={
                <Tooltip
                  title={getString(
                    'performanceStatistic.tooltips.talkTimeLastHour'
                  )}
                >
                  <span>
                    <PhoneClockIcon
                      className="w-3.5 h-3.5"
                      fillColor={defaultIconColor}
                    />
                  </span>
                </Tooltip>
              }
              value={talkTimeSeconds}
              className={withActiveBackground(
                getBackgroundTalkTimebyValue(talkTimeSeconds ?? '')
              )}
            />
            <StatItem
              icon={
                <Tooltip
                  title={getString(
                    'performanceStatistic.tooltips.averageTimePerSuccessLastHour'
                  )}
                >
                  <span>
                    <TrendingUpIcon
                      className="w-6 h-6"
                      fillColor={defaultIconColor}
                    />
                  </span>
                </Tooltip>
              }
              value={averageTimePerSuccessfulCallSeconds}
              className={withActiveBackground(
                getBackgroundAvgCallTimebyValue(
                  averageTimePerSuccessfulCallSeconds ?? ''
                )
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-0 mt-1">
          <div className="text-[11px] leading-4 text-[#CACACA] mb-1">
            {getString('performanceStatistic.sections.followUps')}
          </div>
          <div className="flex items-center gap-1.5">
            <StatItem
              icon={
                <Tooltip
                  title={getString(
                    'performanceStatistic.tooltips.numberOfLeadsInTank'
                  )}
                >
                  <span>
                    <CoinsIcon
                      className="w-5 h-5"
                      fillColor={defaultIconColor}
                    />
                  </span>
                </Tooltip>
              }
              value={numberOfLeadsInTank}
              className={withActiveBackground(
                getBackgroundLeadsInTankbyValue(numberOfLeadsInTank)
              )}
            />
            <StatItem
              icon={
                <Tooltip
                  title={getString(
                    'performanceStatistic.tooltips.attemptsLastHour'
                  )}
                >
                  <span>
                    <FileTextIcon
                      className="w-5 h-5"
                      fillColor={
                        (followupsAttemptsLastHour ?? 0) > 0
                          ? defaultIconColor
                          : '#CACACA'
                      }
                    />
                  </span>
                </Tooltip>
              }
              value={`${(followupsAttemptsLastHour ?? 0) > 0 ? followupsAttemptsLastHour : '\u00A0 - '}`}
              className={withActiveBackground(
                getBackgroundFollowUpAttemptsbyValue(
                  followupsAttempts ?? 0,
                  followupsSuccessful ?? 0
                )
              )}
            />
            <StatItem
              icon={
                <Tooltip
                  title={getString(
                    'performanceStatistic.tooltips.successAttemptsLastHour'
                  )}
                >
                  <span>
                    <ArrowUpWideIcon
                      className="w-5 h-5"
                      fillColor={
                        (followupsSuccessRate ?? 0) > 0
                          ? defaultIconColor
                          : '#CACACA'
                      }
                    />
                  </span>
                </Tooltip>
              }
              value={
                (followupsSuccessRate ?? 0) > 0
                  ? `${followupsSuccessRate}%`
                  : '\u00A0 - '
              }
              className={withActiveBackground(
                getBackgroundSuccessfulFollowupsbyValue(
                  followupsSuccessRate ?? 0
                )
              )}
            />
          </div>
        </div>

        <div className="flex flex-col gap-0 mt-1">
          <div className="text-[11px] leading-4 text-[#CACACA]">
            {getString('performanceStatistic.sections.leads')}
          </div>
          <div className="flex items-center gap-0.5">
            <StatItem
              width="w-12"
              icon={
                <Tooltip
                  title={getString('performanceStatistic.tooltips.noAnswer')}
                >
                  <span>
                    <MessageSquareOffIcon
                      className="w-5 h-5"
                      fillColor="#005098"
                    />
                  </span>
                </Tooltip>
              }
              value={numberOfLeadsNoAnswer}
            />
            <StatItem
              width="w-12"
              icon={
                <Tooltip
                  title={getString('performanceStatistic.tooltips.rejected')}
                >
                  <span>
                    <AlertCircleIcon className="w-5 h-5" fillColor="#005098" />
                  </span>
                </Tooltip>
              }
              value={numberOfLeadsRejected}
            />
            <StatItem
              width="w-12"
              icon={
                <Tooltip
                  title={getString('performanceStatistic.tooltips.contacted')}
                >
                  <span>
                    <MessagesSquareIcon
                      className="w-5 h-5"
                      fillColor="#005098"
                    />
                  </span>
                </Tooltip>
              }
              value={numberOfLeadsContacted}
            />
            <StatItem
              width="w-12"
              icon={
                <Tooltip
                  title={getString(
                    'performanceStatistic.tooltips.numberOfFollowUpsSet'
                  )}
                >
                  <span>
                    <UploadArrowIcon className="w-5 h-5" fillColor="#005098" />
                  </span>
                </Tooltip>
              }
              value={numberOfFollowUpsSet}
            />
            <StatItem
              width="w-12"
              icon={
                <Tooltip
                  title={getString(
                    'performanceStatistic.tooltips.waitingForPayment'
                  )}
                >
                  <span>
                    <CheckCircleIconAlt
                      className="w-5 h-5"
                      fillColor="#005098"
                    />
                  </span>
                </Tooltip>
              }
              value={numberOfLeadsPendingPayment}
            />
            <StatItem
              width="w-12"
              icon={
                <Tooltip
                  title={getString(
                    'performanceStatistic.tooltips.numberOfOrdersCreated'
                  )}
                >
                  <span>
                    <OrdersCreatedIcon
                      className="w-5 h-5"
                      fillColor="#005098"
                    />
                  </span>
                </Tooltip>
              }
              value={numberOfOrdersCreated ?? 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallStatsCard;
