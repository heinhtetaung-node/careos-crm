import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { format } from 'date-fns';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import CallStatsCard from './CallStatsCard';
import VirtualizedRows from './VirtualizedRows';
import {
  POLLING_INTERVAL,
  RenderSkeletonCards,
  mapPerformanceStatsToCards,
  PerformanceStatFilters,
} from '../helper';

import { getString } from 'presentation/theme/localization';
import { useLiveListen } from 'presentation/context/LiveListenContext';
import {
  PerformanceStat,
  useLazyGetPerformanceStatsQuery,
} from 'data/slices/performanceStatisticSlice';
import { useAppSelector } from 'presentation/redux/hooks/typedHooks';

interface PerformanceStatisticContentProps {
  readonly filters: PerformanceStatFilters;
  readonly watchedUserIds: Set<string>;
  readonly onToggleWatched: (userId: string) => void;
  readonly onStatsChange?: (stats: PerformanceStat[]) => void;
}

const MemoizedCallStatsCard = React.memo(CallStatsCard);
const CARD_WIDTH = 278;
const GRID_GAP = 12;
const CARD_HEIGHT = 240;
const CARD_ROW_HEIGHT = CARD_HEIGHT + 20;
const CARD_ROW_HEIGHT_CLASS = 'h-[260px]';
const OVERSCAN_ROWS = 3;
const LIVE_TIMER_STATUSES = new Set([
  'oncall',
  'idle-yellow',
  'idle-red',
  'idle-green',
]);
const POLLING_INTERVAL_PAST_DATE = 120_000; // 2 min — historical data rarely changes

type FilterClauseValue = string | { value?: string; name?: string };

export default function PerformanceStatisticContent({
  filters,
  watchedUserIds,
  onToggleWatched,
  onStatsChange,
}: Readonly<PerformanceStatisticContentProps>) {
  const [fetchPerformanceStats, { data: performanceStatsData }] =
    useLazyGetPerformanceStatsQuery();
  const [accumulatedStats, setAccumulatedStats] = useState<PerformanceStat[]>(
    []
  );
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [isTabVisible, setIsTabVisible] = useState(() => !document.hidden);
  const [containerWidth, setContainerWidth] = useState(0);
  const [gridTopOffset, setGridTopOffset] = useState(0);
  const [isVirtualizationReady, setIsVirtualizationReady] = useState(false);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const pollCounterRef = useRef(0);
  const isPollingRequestRef = useRef(false);
  const initialLoadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const { handleLiveListen } = useLiveListen();
  const globalProduct = useAppSelector(
    (state) => state.typeSelectorReducer.globalProductSelectorReducer.data
  );
  const buildClause = useCallback(
    (field: string, values?: FilterClauseValue[]) => {
      if (!values || values.length === 0) return undefined;
      const normalizedValues = values
        .map((item) => {
          if (typeof item === 'string') return item;
          if (typeof item.value === 'string') return item.value;
          if (typeof item.name === 'string') return item.name;
          return '';
        })
        .filter(Boolean);
      if (normalizedValues.length === 0) return undefined;
      if (normalizedValues.length === 1)
        return `${field}="${normalizedValues[0]}"`;
      const joinedValues = normalizedValues
        .map((value) => `"${value}"`)
        .join(', ');
      return `${field} in (${joinedValues})`;
    },
    []
  );
  const buildFilterQuery = useCallback(
    (filtersToApply: PerformanceStatFilters) => {
      const clauses: string[] = [];
      const statusClause = buildClause(
        'presence.status',
        filtersToApply.status
      );
      const teamClause = buildClause('team', filtersToApply.team);
      const userClause = buildClause('user', filtersToApply.user);
      const productClause = globalProduct
        ? buildClause('product', [globalProduct])
        : undefined;
      if (statusClause) clauses.push(statusClause);
      if (teamClause) clauses.push(teamClause);
      if (userClause) clauses.push(userClause);
      if (productClause) clauses.push(productClause);
      if (filtersToApply.date) {
        clauses.push(`date="${filtersToApply.date}"`);
      }
      clauses.push(`interval="${filtersToApply.interval ?? '1h'}"`);
      return clauses.join(' ');
    },
    [buildClause, globalProduct]
  );
  const handleFetchPerformanceStats = useCallback(
    async (nextFilters: PerformanceStatFilters, isPolling = false) => {
      if (isPolling) {
        isPollingRequestRef.current = true;
        pollCounterRef.current += 1;
        fetchPerformanceStats({
          status: nextFilters.status,
          team: nextFilters.team,
          filter: buildFilterQuery(nextFilters),
          poll: pollCounterRef.current,
        });
      } else {
        isPollingRequestRef.current = false;
        setIsInitialLoading(true);
        await fetchPerformanceStats({
          status: nextFilters.status,
          team: nextFilters.team,
          filter: buildFilterQuery(nextFilters),
        });
        if (initialLoadingTimeoutRef.current) {
          clearTimeout(initialLoadingTimeoutRef.current);
        }
        initialLoadingTimeoutRef.current = setTimeout(() => {
          setIsInitialLoading(false);
        }, 1000);
      }
    },
    [buildFilterQuery, fetchPerformanceStats]
  );

  useEffect(() => {
    if (!performanceStatsData?.stats) return;
    const newStats = performanceStatsData.stats;
    if (isPollingRequestRef.current) {
      if (newStats.length === 0) {
        setAccumulatedStats([]);
        return;
      }
      setAccumulatedStats((prevStats) => {
        const existingUserMap = new Map(
          prevStats.map((stat) => [stat.user, stat])
        );
        const newItems: typeof prevStats = [];
        const updatedItems: typeof prevStats = [];
        const newIds = new Set<string>();
        newStats.forEach((stat) => {
          if (existingUserMap.has(stat.user)) {
            updatedItems.push(stat);
          } else {
            newItems.push(stat);
            newIds.add(stat.user);
          }
        });
        const updatedUserIds = new Set(updatedItems.map((stat) => stat.user));
        const remainingExisting = prevStats.filter(
          (stat) => !updatedUserIds.has(stat.user) && !newIds.has(stat.user)
        );
        return [...newItems, ...updatedItems, ...remainingExisting];
      });
    } else {
      setAccumulatedStats(newStats);
    }
  }, [performanceStatsData]);
  const stats = accumulatedStats;

  const isPastDate = useMemo(() => {
    if (!filters.date) return false;
    const today = format(new Date(), 'yyyy-MM-dd');
    return filters.date < today;
  }, [filters.date]);

  useEffect(() => {
    onStatsChange?.(stats);
  }, [onStatsChange, stats]);

  useEffect(() => {
    handleFetchPerformanceStats(filters);
  }, [filters, handleFetchPerformanceStats]);

  useEffect(() => {
    const pollMs = isPastDate ? POLLING_INTERVAL_PAST_DATE : POLLING_INTERVAL;
    const intervalId = setInterval(() => {
      handleFetchPerformanceStats(filters, true);
    }, pollMs);
    return () => {
      clearInterval(intervalId);
    };
  }, [filters, handleFetchPerformanceStats, isPastDate]);
  const performanceCards = useMemo(() => {
    const cards = mapPerformanceStatsToCards(stats);
    const watchedCards: typeof cards = [];
    const nonWatchedCards: typeof cards = [];
    cards.forEach((card) => {
      if (watchedUserIds.has(card.userId)) {
        watchedCards.push(card);
      } else {
        nonWatchedCards.push(card);
      }
    });
    return [...watchedCards, ...nonWatchedCards];
  }, [stats, watchedUserIds]);

  useEffect(() => {
    const node = gridContainerRef.current;

    if (!node) return () => {};

    const updateWidth = () => {
      setContainerWidth(node.clientWidth || 0);
      setGridTopOffset(
        node.getBoundingClientRect().top +
          (window.pageYOffset || document.documentElement.scrollTop || 0)
      );
      setIsVirtualizationReady(true);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    const onResize = updateWidth;

    observer.observe(node);
    window.addEventListener('resize', onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', onResize);
      if (initialLoadingTimeoutRef.current) {
        clearTimeout(initialLoadingTimeoutRef.current);
        initialLoadingTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const columnCount = useMemo(() => {
    if (containerWidth <= 0) return 1;
    return Math.max(
      1,
      Math.floor((containerWidth + GRID_GAP) / (CARD_WIDTH + GRID_GAP))
    );
  }, [containerWidth]);

  const virtualizationEnabled = performanceCards.length > 40;

  const totalRows = useMemo(
    () => Math.ceil(performanceCards.length / columnCount),
    [performanceCards.length, columnCount]
  );

  const rowVirtualizer = useWindowVirtualizer({
    count: totalRows,
    estimateSize: () => CARD_ROW_HEIGHT,
    overscan: OVERSCAN_ROWS,
    scrollMargin: gridTopOffset,
    enabled: virtualizationEnabled && isVirtualizationReady,
  });

  const virtualRows =
    virtualizationEnabled && isVirtualizationReady
      ? rowVirtualizer.getVirtualItems()
      : [];

  const visibleCardsForTicker = useMemo(() => {
    if (!virtualizationEnabled || !isVirtualizationReady) {
      return performanceCards;
    }

    const cards = [] as typeof performanceCards;
    virtualRows.forEach((virtualRow) => {
      const rowStart = virtualRow.index * columnCount;
      const rowEnd = Math.min(rowStart + columnCount, performanceCards.length);
      cards.push(...performanceCards.slice(rowStart, rowEnd));
    });
    return cards;
  }, [
    columnCount,
    isVirtualizationReady,
    performanceCards,
    virtualRows,
    virtualizationEnabled,
  ]);

  const shouldRunTicker =
    isTabVisible &&
    visibleCardsForTicker.some((card) => LIVE_TIMER_STATUSES.has(card.status));

  useEffect(() => {
    let tickerId: NodeJS.Timeout | null = null;

    if (shouldRunTicker) {
      setNowTick(Date.now());

      tickerId = setInterval(() => {
        setNowTick(Date.now());
      }, 1000);
    }

    return () => {
      if (tickerId) {
        clearInterval(tickerId);
      }
    };
  }, [shouldRunTicker]);

  useEffect(() => {
    if (!isPollingRequestRef.current) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [performanceStatsData]);

  const noopOpenPopupAudioRender = useCallback(() => {}, []);

  return (
    <div className="p-4">
      <div
        ref={gridContainerRef}
        className="flex flex-row gap-3 flex-wrap"
        data-testid="performance-statistics-grid"
      >
        {performanceCards.length === 0 &&
          (isInitialLoading ? (
            <RenderSkeletonCards />
          ) : (
            <div
              className="text-sm text-gray-500"
              data-testid="performance-statistic-empty"
            >
              {isPastDate
                ? getString('performanceStatistic.emptyPastDate')
                : getString('text.noData')}
            </div>
          ))}
        {performanceCards.length > 0 &&
          (!virtualizationEnabled || !isVirtualizationReady) && (
            <div className="flex flex-row gap-3 flex-wrap w-full">
              {performanceCards.map((card) => (
                <div key={card.userId}>
                  <MemoizedCallStatsCard
                    {...card}
                    nowTick={
                      LIVE_TIMER_STATUSES.has(card.status) ? nowTick : undefined
                    }
                    openPopupAudioRender={noopOpenPopupAudioRender}
                    handleLiveListen={handleLiveListen}
                    isWatched={watchedUserIds.has(card.userId)}
                    onToggleWatched={onToggleWatched}
                    isPastDate={isPastDate}
                  />
                </div>
              ))}
            </div>
          )}
        {performanceCards.length > 0 &&
          virtualizationEnabled &&
          isVirtualizationReady && (
            <VirtualizedRows
              virtualRows={virtualRows}
              totalHeight={rowVirtualizer.getTotalSize()}
              scrollMargin={gridTopOffset}
              columnCount={columnCount}
              performanceCards={performanceCards}
              nowTick={nowTick}
              watchedUserIds={watchedUserIds}
              onToggleWatched={onToggleWatched}
              handleLiveListen={handleLiveListen}
              openPopupAudioRender={noopOpenPopupAudioRender}
              cardRowHeightClass={CARD_ROW_HEIGHT_CLASS}
              liveTimerStatuses={LIVE_TIMER_STATUSES}
              isPastDate={isPastDate}
            />
          )}
      </div>
    </div>
  );
}
