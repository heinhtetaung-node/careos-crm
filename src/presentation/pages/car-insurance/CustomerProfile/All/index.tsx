import { useLazyGetCustomerProfilesQuery } from 'data/slices/customerSlice';
import { initialPageState } from 'data/slices/importSlices/helper';
import FilterPanel from 'presentation/components/FilterPanel';
import useTableList from 'presentation/hooks/useTableList';
import React, { useCallback, useState } from 'react';

import {
  columns,
  filterFields,
  FilterPayload,
  formatFilterURI,
  tableInitialValues,
} from './config';

function CustomerDashBoard() {
  const [filterURI, setFilterURI] = useState('');
  const { TableComponent, TopComponent } = useTableList(
    'allCustomerProfile',
    columns,
    { ...initialPageState, filter: filterURI },
    useLazyGetCustomerProfilesQuery,
    undefined,
    undefined,
    []
  );

  const handleSubmit = useCallback((payload: FilterPayload) => {
    setFilterURI(formatFilterURI(payload));
  }, []);

  const handleResetFilter = useCallback(() => {
    setFilterURI('');
  }, []);

  return (
    <div data-testid="customer-dashboard">
      <div>
        <FilterPanel
          fields={filterFields}
          initialValues={tableInitialValues}
          onSubmit={handleSubmit}
          onReset={handleResetFilter}
        />
      </div>
      <div className="flex flex-col mt-2">
        <div>
          <TopComponent />
        </div>
        <div className="mt-1">
          <TableComponent />
        </div>
      </div>
    </div>
  );
}
export default CustomerDashBoard;
