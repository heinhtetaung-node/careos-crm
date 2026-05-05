import { Grid } from '@material-ui/core';
import { useLazyGetAllRefundsQuery } from 'data/slices/cancellationSlice';
import FilterPanel from 'presentation/components/FilterPanel';
import useTableList from 'presentation/hooks/useTableList';
import React, { useState } from 'react';
import {
  filterFields,
  getFilterPanelQueryString,
  tableColumns,
} from './helper';
import { useGetUserSelector } from 'presentation/redux/selectors/user';

export default function RefundsPage() {
  const [currentFilter, setCurrentFilter] = useState<string>('');

  const currentUser = useGetUserSelector();

  const { TableComponent, TopComponent } = useTableList(
    'refunds',
    tableColumns(currentUser.role),
    {
      filter: currentFilter,
    },
    useLazyGetAllRefundsQuery,
    undefined,
    undefined,
    []
  );

  const handleFilterSubmit = (payload: any) => {
    const filterString = getFilterPanelQueryString({ filters: payload });
    console.log(filterString);
    setCurrentFilter(filterString);
  };

  const handleFilterReset = () => {
    setCurrentFilter('');
  };

  return (
    <div>
      <Grid container>
        <Grid item xs={12} md={12} lg={12}>
          <FilterPanel
            fields={filterFields}
            initialValues={{}}
            onSubmit={handleFilterSubmit}
            onReset={handleFilterReset}
          />
        </Grid>
      </Grid>
      <Grid container className="bg-white mt-8 pt-6 pb-6">
        <Grid item xs={12} className="text-right pb-4">
          <TopComponent />
        </Grid>
        <TableComponent />
      </Grid>
    </div>
  );
}
