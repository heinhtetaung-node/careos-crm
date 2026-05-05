/* eslint-disable jsx-a11y/control-has-associated-label */
import { FolderOpenIcon } from '@alphafounders/icons';
import queryString from 'query-string';
import React, { useCallback, useState } from 'react';

import {
  columns,
  ActionComponentProps,
  MAX_CUSTOMERS,
  fields,
  initialValuesOfFilter,
} from './config';
import { useLazyGetCustomerProfilesQuery } from 'data/slices/customerSlice';
import { initialPageState } from 'data/slices/importSlices/helper';
import Checkbox from 'presentation/components/controls/Checkbox';
import Controls from 'presentation/components/controls/Control';
import FilterPanel from 'presentation/components/FilterPanel';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import getApiEndpoint from 'utils/endpointHelper';
import useSnackbar from 'utils/snackbar';

function ActionComponent({
  row,
  selectedCustomers,
  onSelect,
}: Readonly<ActionComponentProps>) {
  return (
    <div className="flex flex-rows items-center">
      <Checkbox
        checked={selectedCustomers.includes(row.id)}
        onChange={() => onSelect(row.id)}
        data-testid="data-checkbox"
      />
      <a href={getApiEndpoint(`/${row.id}`)} target="_blank" rel="noreferrer">
        <FolderOpenIcon fontSize="large" id="data-redirect" />
      </a>
    </div>
  );
}

function CustomerMergePage() {
  const [filterURI, setFilterURI] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const { showErrorSnackbar } = useSnackbar();

  const handleSubmit = useCallback((payload: any) => {
    setFilterURI(payload);
  }, []);
  const handleResetFilter = useCallback(() => setFilterURI(''), []);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedCustomers((prevState) => {
        if (prevState.includes(id)) {
          return prevState.filter((_id) => _id !== id);
        }
        const updatedIds = [...prevState, id];
        if (updatedIds.length > MAX_CUSTOMERS) {
          showErrorSnackbar(getString('customerMerge.limitExceedError'));
          return prevState;
        }

        return updatedIds;
      });
    },
    [showErrorSnackbar]
  );

  const handleMergeCustomer = () => {
    const queryPath = queryString.stringify(
      { id: selectedCustomers },
      { arrayFormat: 'bracket-separator', arrayFormatSeparator: '&' }
    );

    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = getApiEndpoint(`/customers-merge/customers?${queryPath}`);
    link.setAttribute('data-testid', 'redirect-btn');
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
  };

  const { TableComponent, TopComponent } = useTableList(
    'customersMerge',
    columns,
    { ...initialPageState, filter: filterURI },
    useLazyGetCustomerProfilesQuery,
    undefined,
    undefined,
    []
  );

  return (
    <div data-testid="customer-merge-dashboard">
      <div className="flex flex-row">
        <FilterPanel
          fields={fields}
          initialValues={initialValuesOfFilter}
          onSubmit={handleSubmit}
          onReset={handleResetFilter}
        />
      </div>
      <div className="flex flex-col mt-2">
        <div className="flex flex-row justify-between m-2">
          <Controls.Button
            text={getString('customerMerge.mergeButtonText')}
            color="primary"
            onClick={handleMergeCustomer}
            disabled={selectedCustomers.length < MAX_CUSTOMERS}
          />
          <TopComponent />
        </div>
        <div className="mt-1">
          <TableComponent
            ActionCellElements={({ row }) =>
              ActionComponent({
                row,
                selectedCustomers,
                onSelect: handleSelect,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

export default CustomerMergePage;
