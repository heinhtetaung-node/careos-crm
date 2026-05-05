import _find from 'lodash/find';
import React from 'react';

import { getQueryParts } from 'data/gateway/api/resource/leadSearch';
import { Column } from 'presentation/components/OrderListingTable/helper';
import {
  getOrderLead,
  changeSortStatus,
  SORT_TABLE_TYPE,
} from 'presentation/components/TableAllLead/TableAllLead.helper';

export interface HandleResetProps {
  setColumnsSetting: React.Dispatch<React.SetStateAction<Column[]>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  refetch: (params: any) => void;
  productType: string;
  interestedColumn?: string;
  initialQueryPayload?: string;
  filters?: string[] | [];
  assignedTo?: string;
}

export const updateInterestedColumn = (
  columns: Column[],
  sorting: 'desc' | 'none' | 'asc',
  interestedColumn: string
): Column[] =>
  columns.map((column) => {
    if (column.id === interestedColumn) return { ...column, sorting };
    return { ...column, sorting: 'none' };
  });

export function modifyQueryWithFilter(
  payload: HandleResetProps,
  filters: string[],
  shouldAddFilter: boolean
): HandleResetProps {
  if (shouldAddFilter) return { ...payload, filters };
  return payload;
}

export const handleReset = ({
  setColumnsSetting,
  setCurrentPage,
  refetch,
  productType,
  interestedColumn = 'earliestPolicyStartDate',
  initialQueryPayload = 'order_by=attributes.earliestPolicyStartDate desc',
  filters,
  assignedTo = '', // need this value to decide which agent("qcAgent" or "documentAgent") to show after reset made.
}: HandleResetProps) => {
  const queryParts = getQueryParts(
    productType,
    filters ?? undefined,
    15,
    1,
    initialQueryPayload
  );
  setColumnsSetting((columns) =>
    updateInterestedColumn(columns, 'desc', interestedColumn)
  );
  setCurrentPage(1);
  refetch({ params: `${queryParts.join('&')}`, assignedTo });
};

const sortParams = (
  columnId: string | undefined,
  setColumnSettings?: React.SetStateAction<any>,
  columnSetting?: Column[]
) => {
  let sortColumn: Column;
  if (!columnId) {
    // no columnId mean there is no sorting take place.
    sortColumn = _find(
      columnSetting,
      (column) => !!column.sorting && column.sorting !== 'none'
    ) as Column;
    return sortColumn
      ? getOrderLead(
          sortColumn.sortingField as string,
          sortColumn.sorting as SORT_TABLE_TYPE
        )
      : '';
  }
  // now we have columnId to sort
  sortColumn = _find(columnSetting, ['id', columnId]) as Column;
  const sorting = changeSortStatus(sortColumn?.sorting as SORT_TABLE_TYPE);
  if (setColumnSettings && columnSetting) {
    setColumnSettings(
      updateInterestedColumn(columnSetting, sorting, sortColumn.id)
    ); // updated interested column and reset other columns as default
  }

  return getOrderLead(sortColumn?.sortingField as string, sorting);
};

export default sortParams;
