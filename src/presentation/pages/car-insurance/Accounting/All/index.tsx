import FilterPanel from 'presentation/components/FilterPanel';
import useTableList from 'presentation/hooks/useTableList';
import React, { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet';

import { useLazyGetAllItemsQuery } from 'data/slices/accountingSlice';
import {
  initialFilter,
  prepareFilter,
} from '../../OrderCancellation/All/helper';
import { Columns, fields } from './config';

export default function AccountingAllPage() {
  const initialFilterAccountingAll = {
    ...initialFilter,
  };
  const [currentFilter, setCurrentFilter] = useState(
    initialFilterAccountingAll
  );
  const [orderAllColSettings, setOrderAllColSettings] = useState<any>({});

  const { TableComponent, TopComponent } = useTableList(
    'all-accounting',
    Columns,
    currentFilter,
    useLazyGetAllItemsQuery
  );

  const handleSubmit = useCallback(
    (payload: any, newPageState?: any, columnId?: string) => {
      prepareFilter(
        payload,
        orderAllColSettings,
        setOrderAllColSettings,
        setCurrentFilter,
        currentFilter,
        newPageState,
        columnId
      );
    },
    []
  );

  const handleResetFilter = useCallback(() => {
    setCurrentFilter({
      ...currentFilter,
    });
  }, []);

  return (
    <div data-testid="accounting-listing-page">
      <Helmet title="Accounting - Listing View Page" />

      <div className="flex flex-row">
        <FilterPanel
          fields={fields}
          initialValues={initialFilter}
          onSubmit={handleSubmit}
          onReset={handleResetFilter}
        />
      </div>
      <div className="flex flex-row items-center justify-end mt-2 p-4 bg-white">
        <TopComponent />
      </div>

      <div className="mt-1">
        <TableComponent />
      </div>
    </div>
  );
}
