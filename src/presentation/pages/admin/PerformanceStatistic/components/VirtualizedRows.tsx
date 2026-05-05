import React from 'react';
import CallStatsCard from './CallStatsCard';
import { PerformanceCardData } from '../helper';

const MemoizedCallStatsCard = React.memo(CallStatsCard);

interface VirtualizedRowsProps {
  readonly virtualRows: Array<{ key: React.Key; index: number; start: number }>;
  readonly totalHeight: number;
  readonly scrollMargin: number;
  readonly columnCount: number;
  readonly performanceCards: PerformanceCardData[];
  readonly nowTick: number;
  readonly watchedUserIds: Set<string>;
  readonly onToggleWatched: (userId: string) => void;
  readonly handleLiveListen: (
    activeCallId: string,
    agentName: string,
    leadId: string,
    callDuration: string
  ) => void;
  readonly openPopupAudioRender: (open: boolean) => void;
  readonly cardRowHeightClass: string;
  readonly liveTimerStatuses: ReadonlySet<string>;
  readonly isPastDate?: boolean;
}

function VirtualizedRows({
  virtualRows,
  totalHeight,
  scrollMargin,
  columnCount,
  performanceCards,
  nowTick,
  watchedUserIds,
  onToggleWatched,
  handleLiveListen,
  openPopupAudioRender,
  cardRowHeightClass,
  liveTimerStatuses,
  isPastDate = false,
}: Readonly<VirtualizedRowsProps>) {
  return (
    <div className="relative w-full" style={{ height: `${totalHeight}px` }}>
      {virtualRows.map((virtualRow) => {
        const rowStart = virtualRow.index * columnCount;
        const rowCards = performanceCards.slice(
          rowStart,
          Math.min(rowStart + columnCount, performanceCards.length)
        );

        return (
          <div
            key={virtualRow.key}
            className={`absolute top-0 left-0 w-full ${cardRowHeightClass}`}
            style={{
              transform: `translateY(${virtualRow.start - scrollMargin}px)`,
            }}
          >
            <div className="flex flex-row gap-3 w-full items-start">
              {rowCards.map((card) => (
                <div key={card.userId}>
                  <MemoizedCallStatsCard
                    {...card}
                    nowTick={
                      liveTimerStatuses.has(card.status) ? nowTick : undefined
                    }
                    openPopupAudioRender={openPopupAudioRender}
                    handleLiveListen={handleLiveListen}
                    isWatched={watchedUserIds.has(card.userId)}
                    onToggleWatched={onToggleWatched}
                    isPastDate={isPastDate}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default VirtualizedRows;
