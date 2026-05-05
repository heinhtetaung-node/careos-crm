import React from 'react';

import { useLazyGetResourceHistoryQuery } from 'data/slices/leadDetails/activitySlice/api';
import useTableList from 'presentation/hooks/useTableList';
import { initialPageState } from 'presentation/hooks/useTableList/helper';
import { useGetLeadSelector } from 'presentation/redux/selectors/lead';

import { tableColumns } from './activityTable.helper';

function ActivityTable() {
  const lead = useGetLeadSelector();
  const { TableComponent } = useTableList(
    'leadHistory',
    tableColumns,
    { ...initialPageState, leadId: lead.name },
    useLazyGetResourceHistoryQuery,
    undefined,
    undefined,
    []
  );
  return <TableComponent />;
}

export default ActivityTable;
