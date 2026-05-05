import { BlueEditIcon as EditIcon } from '@alphafounders/icons';
import { Divider, Grid, makeStyles } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/styles';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';

import {
  useLazyGetAutoAssignLeadsQuery,
  useLazyGetAutoAssignSettingsQuery,
} from 'data/slices/autoAssignLeadSlice';
import { initialPageState } from 'data/slices/importSlices/helper';
import { useLazyGetTeamsQuery } from 'data/slices/teamSlice';
import { useLazyGetAssignedUsersQuery } from 'data/slices/userSlice';
import Controls from 'presentation/components/controls/Control';
import FilterPanel from 'presentation/components/FilterPanel';
import CommonModal from 'presentation/components/modal/CommonModal';
import useTableList from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';

import AutoAssignSettingModal from './component/autoAssignSettingModal';
import AutoAssignStatusModal from './component/autoAssignStatusModal';
import {
  Columns,
  filterFields,
  tableInitialValues,
  SettingHeaderTemplate,
  addFilterToURI,
} from './helper';
import { HeaderOption } from './types';

const useStyles = makeStyles((theme) => ({
  shared_input: {
    '& .MuiInput-root.MuiInputBase-formControl.MuiInput-formControl': {
      border: `1px solid ${theme.palette.grey[200]}`,
      minHeight: 42,
      padding: '3px 16px',
      borderRadius: 10,
      '&:hover,&:focus,&:active': {
        border: `1px solid ${theme.palette.primary.main}`,
      },
    },
  },
  statusText: {
    textTransform: 'uppercase',
    color: 'white',
    borderRadius: 50,
    padding: '5px 10px',
    '&.success': {
      backgroundColor: theme.palette.success.dark,
    },
    '&.error': {
      backgroundColor: theme.palette.error.dark,
    },
    '& .MuiSvgIcon-root': {
      verticalAlign: 'text-top',
    },
  },
}));
function AutoAssignConfigsPage() {
  const [shouldUpdateTable, setUpdateTable] = useState(false);
  const [settingModal, setSettingModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [selected, setSelected] = useState('');
  const [agentStatus, setAgentStatus] = useState(false);
  const [filterURI, setFilterURI] = useState('');
  const [getAssignedUsersQuery, { isLoading: assignedListLoading }] =
    useLazyGetAssignedUsersQuery();
  const [getTeams] = useLazyGetTeamsQuery();

  const classes = useStyles();
  const [getSettings, { data: settingsData, isLoading: isFetchingSettings }] =
    useLazyGetAutoAssignSettingsQuery({});

  useEffect(() => {
    getSettings({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = useCallback((payload: any) => {
    setFilterURI(addFilterToURI(payload));
  }, []);
  const handleSelect = useCallback((id: string) => {
    setSelected((prevId) => (prevId === id ? '' : id));
  }, []);

  const HeaderOptions = useMemo(
    () =>
      SettingHeaderTemplate({
        classes,
        params: settingsData,
        isLoading: isFetchingSettings,
      }),
    [isFetchingSettings, settingsData, classes]
  );
  useEffect(() => {
    const timer = setTimeout(() => {
      setUpdateTable((prev) => !prev);
    }, 3000);
    return () => clearTimeout(timer);
  }, [settingsData]);

  const { TableComponent, TopComponent } = useTableList(
    'autoAssignConfigs',
    Columns,
    {
      ...initialPageState,
      filter: `team.leadType="new" ${filterURI}`,
    },
    useLazyGetAutoAssignLeadsQuery,
    selected,
    handleSelect,
    [shouldUpdateTable, agentStatus, settingsData, isFetchingSettings] // to update the table
  );

  const getAllAssigedUsers = () => getAssignedUsersQuery('pageSize=500');
  const _filterFields = useMemo(
    () => {
      const fields = filterFields(classes, getTeams);
      fields.splice(2, 0, {
        InputComponent: Controls.Autocomplete,
        inputProps: {
          className: classes.shared_input as unknown as ClassNameMap<string>,
          name: 'fullName',
          label: getString('text.name'),
          labelField: 'fullName',
          fixedLabel: true,
          async: true,
          onFocusFn: getAllAssigedUsers,
          filterType: 'summary',
          hasFormattedResponse: true,
          loading: assignedListLoading,
          apiDataField: 'assignedUsers',
          responsive: {
            xs: 6,
            md: 3,
          },
          hasSelectAll: true,
        },
      });
      return fields;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [assignedListLoading]
  );

  const handleCloseSettingModal = useCallback(
    (isSuccess?: boolean) => {
      if (isSuccess) {
        getSettings({});
      }
      setSettingModal(false);
    },
    [getSettings]
  );
  const handleDisplaySettingModal = useCallback(
    () => setSettingModal(true),
    []
  );
  const handleDisplayStatusModal = useCallback(() => setStatusModal(true), []);
  const handleCloseModal = useCallback(
    () => (settingModal ? setSettingModal(false) : setStatusModal(false)),
    [settingModal]
  );
  const handleCloseStatusModal = useCallback((updated?: boolean) => {
    if (updated) {
      setSelected('');
      setAgentStatus((prevState) => !prevState);
    }
    setStatusModal(false);
  }, []);
  const handleResetFilter = useCallback(() => setFilterURI(''), []);

  const isModal = settingModal || statusModal;

  return (
    <div className="admin-team-page" data-testid="admin-sales-page">
      <Helmet title="Admin - Auto Assign" />
      <div className="shadow bg-white pl-8 mb-2">
        <Grid container item justifyContent="flex-end" alignItems="center">
          <Grid item xs={10}>
            <h2 className="text-xl mb-4 ">
              {getString('menu.autoAssignment.root')}
              &nbsp;
              {getString('menu.autoAssignment.configs')}
            </h2>
          </Grid>
          <Grid item xs={2} className="text-center">
            <EditIcon
              data-testid="test-edit-btn"
              className="cursor-pointer"
              onClick={handleDisplaySettingModal}
              fontSize="large"
            />
          </Grid>
        </Grid>
        <Divider />
        <Grid container className="text-center">
          {HeaderOptions.map((opt: HeaderOption) => (
            <Grid key={opt.title} item xs={4}>
              <h4 className="font-medium leading-tight">{opt.title}</h4>
              {opt.content}
            </Grid>
          ))}
        </Grid>
      </div>
      <Grid container>
        <Grid item xs={12} md={12} lg={12}>
          <FilterPanel
            fields={_filterFields}
            initialValues={tableInitialValues}
            onSubmit={handleSubmit}
            onReset={handleResetFilter}
          />
        </Grid>
      </Grid>
      <Grid container className="bg-white mt-8 pt-6 pb-6">
        <Grid item xs={4} className="pb-4">
          <Controls.Button
            data-testid="test-status-btn"
            text={getString('text.changeStatus')}
            color="primary"
            onClick={handleDisplayStatusModal}
            className="uppercase ml-8"
          />
        </Grid>
        <Grid item xs={8} className="text-right">
          <TopComponent />
        </Grid>
        <TableComponent />
      </Grid>

      {/* Modals */}
      {isModal && (
        <CommonModal
          title={getString(
            settingModal ? 'text.settings' : 'text.changeStatus'
          )}
          open={isModal}
          handleCloseModal={handleCloseModal}
        >
          {settingModal ? (
            <AutoAssignSettingModal
              className={classes}
              onClose={handleCloseSettingModal}
              values={settingsData}
            />
          ) : (
            statusModal && (
              <AutoAssignStatusModal
                id={selected}
                onClose={handleCloseStatusModal}
              />
            )
          )}
        </CommonModal>
      )}
    </div>
  );
}

export default AutoAssignConfigsPage;
