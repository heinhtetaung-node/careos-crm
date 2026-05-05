import { useLazyGetOrderHistoryQuery } from 'data/slices/orderSlice';
import useTableList from 'presentation/hooks/useTableList';
import { initialPageState } from 'presentation/hooks/useTableList/helper';
import React from 'react';
import { tableColumns } from './config';

interface HistoryTableProps {
  id: string;
}

export default function HistoryTable({ id }: HistoryTableProps) {
  const { TableComponent } = useTableList(
    'orderHistory',
    tableColumns,
    { ...initialPageState, orderId: id },
    useLazyGetOrderHistoryQuery,
    undefined,
    undefined,
    []
  );

  return (
    <div data-testid="test-history-table">
      <TableComponent />
    </div>
  );
}
