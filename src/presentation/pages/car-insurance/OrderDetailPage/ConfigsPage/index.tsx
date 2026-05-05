/* eslint-disable react-hooks/exhaustive-deps */

import { useFlags } from 'flagsmith/react';
import React, { useState, useCallback, useEffect, useMemo } from 'react';

import FeatureFlags from 'config/flagsmithConfig';
import { initialPageState } from 'data/slices/importSlices/helper';
import { useLazyGetOrderConfigsQuery } from 'data/slices/orderSlice';
import { useLazyGetAllUserStreamingByLeadSearchQuery } from 'data/slices/userSlice';
import Controls from 'presentation/components/controls/Control';
import FilterPanel from 'presentation/components/FilterPanel';
import CommonModal from 'presentation/components/modal/CommonModal';
import useTableList, { Column } from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';

import CreateConfigModal from './createConfigModal';
import DeleteConfigModal from './deleteConfigModal';
import {
  columns,
  filterFields,
  FilterPayload,
  formatFilterURI,
  initialFilter,
  tableInitialValues,
  ConfigImport,
} from './helper';
import StatusModal from './statusModal';

export default function ConfigsPage() {
  const [selected, setSelected] = useState('');
  const [filterURI, setFilterURI] = useState(initialFilter);
  const [statusModal, setStatusModal] = useState(false);
  const [deleteConfigModal, setDeleteConfigModal] = useState(false);
  const [configStatus, setConfigStatus] = useState(false);
  const [createConfigModal, setCreateConfigModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<ConfigImport>();

  const handleSelected = useCallback((id: string) => {
    setSelected((prev) => (prev === id ? '' : id));
  }, []);

  const [getUsersDataFromLeadApi, { isLoading: isUsersDataLoading }] =
    useLazyGetAllUserStreamingByLeadSearchQuery();

  const flags = useFlags([
    FeatureFlags.BROK_902_ADD_NEW_CONFIG_GROUP_IN_AUTO_ASSIGN_20241113_TEMP,
  ]);
  const isNewGroupEnabled =
    flags[
      FeatureFlags.BROK_902_ADD_NEW_CONFIG_GROUP_IN_AUTO_ASSIGN_20241113_TEMP
    ]?.enabled ?? false;

  const { TopComponent, TableComponent } = useTableList(
    'orderConfigs',
    columns as Column[],
    {
      ...initialPageState,
      filter: filterURI,
    },
    useLazyGetOrderConfigsQuery,
    selected,
    handleSelected,
    [configStatus]
  );

  const [fetchConfigData] = useLazyGetOrderConfigsQuery();

  const getSelectedConfig = async () => {
    const config = await fetchConfigData({
      tableType: 'orderConfigs',
      listPageToken: [],
      queryParams: {
        filter: `config.name:"${selected}"`,
        pageSize: 10,
        currentPage: 1,
      },
    });

    setSelectedConfig(config?.data?.imports[0] as ConfigImport);
  };

  useEffect(() => {
    if (selected?.length > 0) getSelectedConfig();
  }, [selected]);

  const handleDisplayStatusModal = useCallback(() => {
    setStatusModal(true);
  }, []);

  const handleDeleteConfigModal = useCallback(() => {
    setDeleteConfigModal(true);
  }, []);

  const handleCloseDeleteConfigModal = useCallback((value?: boolean) => {
    if (value) {
      setSelected('');
      setConfigStatus((prevState) => !prevState);
    }
    setDeleteConfigModal(false);
  }, []);

  const handleSubmit = useCallback((payload: FilterPayload) => {
    setFilterURI(formatFilterURI(payload));
  }, []);

  const handleResetFilter = useCallback(() => {
    setFilterURI(initialFilter);
  }, []);

  const handleCloseStatusModal = useCallback((updated?: boolean) => {
    if (updated) {
      setSelected('');
      setConfigStatus((prevState) => !prevState);
    }
    setStatusModal(false);
  }, []);

  const handleCreateConfigModal = useCallback((value: boolean) => {
    setCreateConfigModal(value);
  }, []);

  const getAgentNameUsersData = () =>
    getUsersDataFromLeadApi(
      `filter=user.role.keyword in("roles/submission","roles/quality-control")`
    );
  const replaceFilterFields = useMemo(
    () => {
      const fields = filterFields(isNewGroupEnabled);
      fields.splice(2, 1, {
        InputComponent: Controls.Autocomplete,
        inputProps: {
          name: 'name',
          label: getString('text.name'),
          async: true,
          placeholder: getString('text.name'),
          onFocusFn: getAgentNameUsersData,
          loading: isUsersDataLoading,
          apiDataField: 'users',
          labelField: 'fullName',
          valueField: 'name',
          filterType: 'summary',
          fixedLabel: true,
          responsive: {
            xs: 6,
            md: 3,
          },
        },
      });
      return fields;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isUsersDataLoading, isNewGroupEnabled]
  );

  return (
    <div className="shadow" data-testid="order-configs-page">
      <div className="p-4 bg-white">
        <div className="flex justify-between items-center">
          <h2>{getString('menu.autoAssignment.orderConfig')}</h2>
        </div>
      </div>

      <FilterPanel
        fields={replaceFilterFields}
        initialValues={tableInitialValues}
        onSubmit={handleSubmit}
        onReset={handleResetFilter}
      />
      <div className="p-4 mt-6 bg-white flex justify-between">
        <div>
          <button
            type="button"
            id="create-config-btn"
            onClick={() => handleCreateConfigModal(true)}
            className="py-2 mr-2 px-5 text-sm bg-primary cursor-pointer text-white font-bold rounded-md border-0"
          >
            {getString('menu.autoAssignment.createConfig')}
          </button>
          <button
            type="button"
            onClick={() => handleDisplayStatusModal()}
            className={`py-2 mr-2 px-5 text-sm ${
              selected === '' ? 'bg-[#D4D4D4]' : 'bg-primary cursor-pointer'
            } text-white font-bold rounded-md border-0`}
            disabled={selected === ''}
            id="status-btn"
          >
            {getString('text.changeStatus')}
          </button>
          <button
            type="button"
            onClick={() => handleDeleteConfigModal()}
            className={`py-2 px-5 text-sm ${
              selected === '' ? 'bg-[#D4D4D4]' : 'bg-primary cursor-pointer'
            } text-white font-bold rounded-md border-0`}
            disabled={selected === ''}
            id="delete-btn"
          >
            {getString('menu.orderAutoAssignmentConfigDelete')}
          </button>
        </div>
        <TopComponent />
      </div>
      <TableComponent />
      <CommonModal
        title={getString('text.changeStatus')}
        open={statusModal}
        handleCloseModal={handleCloseStatusModal}
      >
        <StatusModal id={selected} onClose={handleCloseStatusModal} />
      </CommonModal>

      <CommonModal
        title={getString('menu.autoAssignment.createConfig')}
        open={createConfigModal}
        handleCloseModal={() => handleCreateConfigModal(false)}
      >
        <CreateConfigModal
          onClose={handleCreateConfigModal}
          setConfigStatus={setConfigStatus}
        />
      </CommonModal>

      <CommonModal
        title={getString('menu.orderAutoAssignmentConfigDelete')}
        open={deleteConfigModal}
        handleCloseModal={handleCloseDeleteConfigModal}
      >
        <DeleteConfigModal
          id={selected}
          orderConfigData={selectedConfig}
          onClose={handleCloseDeleteConfigModal}
        />
      </CommonModal>
    </div>
  );
}
