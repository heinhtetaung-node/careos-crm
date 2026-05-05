import React from 'react';
import clsx from 'clsx';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import SyncAltIcon from '@material-ui/icons/SyncAlt';

export interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSort: string;
  direction: 'asc' | 'desc';
  onSort: (column: string) => void;
}

export default function SortableHeader({
  label,
  sortKey,
  currentSort,
  direction,
  onSort,
}: Readonly<SortableHeaderProps>) {
  const isActive = currentSort === sortKey;
  const ariaSortMap = {
    asc: 'ascending',
    desc: 'descending',
  } as const;
  const ariaLabel =
    isActive && direction
      ? `Sort by ${label}, ${ariaSortMap[direction]}`
      : `Sort by ${label}`;
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      aria-label={ariaLabel}
      className={clsx(
        'text-gray-600 font-inherit text-nowrap font-semibold items-center gap-1 ml-2 text-xs px-2 rounded cursor-pointer bg-inherit border-none flex',
        isActive && 'text-primaryColor'
      )}
    >
      {label}
      {isActive ? (
        <ArrowUpwardIcon
          data-testid="chevron-icon"
          className={clsx(
            'text-medium font-semibold -mb-1 ml-1 transition-transform',
            direction === 'asc' && '-rotate-180'
          )}
        />
      ) : (
        <SyncAltIcon className="ml-1 rotate-90 text-medium -mb-1 text-gray-400" />
      )}
    </button>
  );
}
