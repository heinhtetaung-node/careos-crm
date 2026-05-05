import { Grid, FormControl } from '@material-ui/core';
import { useCreateOrderConfigMutation } from 'data/slices/orderSlice';
import { useGetUsersQuery } from 'data/slices/userSlice';
import { format } from 'date-fns';
import { Option } from 'presentation/components/common/FormikFields/LeadAutocomplete/Autocomplete.helper';
import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';
import React, { useState, useEffect, useMemo } from 'react';
import useSnackbar from 'utils/snackbar';
import { useFlags } from 'flagsmith/react';
import FeatureFlags from 'config/flagsmithConfig';

import { agentsFilter, getGroupOptions, initialAgentState } from './helper';

export default function CreateConfigModal({
  onClose,
  setConfigStatus,
}: {
  onClose: (value: boolean) => void;
  setConfigStatus: (value: boolean | ((prev: boolean) => boolean)) => void;
}) {
  const [agentName, setAgentName] = useState<Option>(initialAgentState);
  const [group, setGroup] = useState<Option>(initialAgentState);
  const [agents, setAgents] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { data: agentList, isLoading: isAgentListLoading } =
    useGetUsersQuery(agentsFilter);
  const { showSuccessSnackbar, showErrorSnackbar } = useSnackbar();

  useEffect(() => {
    if (!isAgentListLoading && agentList) {
      const _data = agentList?.users?.map((item: any) => ({
        id: item.name,
        value: item.name,
        title: item.humanId,
      }));
      setAgents(_data);
    }
  }, [agentList, isAgentListLoading]);

  const [
    createConfig,
    { isLoading: isCreateConfig, data: configData, isError, error },
  ] = useCreateOrderConfigMutation({});

  const handleSubmit = () => {
    setLoading(true);
    createConfig({
      effectiveDate: `${format(selectedDate, 'yyyy-MM-dd')}T23:59:59Z`,
      agent: agentName.value as string,
      group: group.value as string,
      absent: false,
    });
  };

  const flags = useFlags([
    FeatureFlags.BROK_902_ADD_NEW_CONFIG_GROUP_IN_AUTO_ASSIGN_20241113_TEMP,
  ]);
  const isNewGroupEnabled =
    flags[
      FeatureFlags.BROK_902_ADD_NEW_CONFIG_GROUP_IN_AUTO_ASSIGN_20241113_TEMP
    ]?.enabled ?? false;

  const groupOptions = useMemo(
    () => getGroupOptions(isNewGroupEnabled),
    [isNewGroupEnabled]
  );
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (!isCreateConfig && configData) {
      const timeout = setTimeout(() => {
        showSuccessSnackbar(
          getString('menu.autoAssignment.agentStatusUpdated')
        );
        setConfigStatus((state: boolean) => !state);
        onClose(false);
        setLoading(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
    if (isError) {
      showErrorSnackbar((error as any)?.data?.message);
      setConfigStatus((state: boolean) => !state);
      onClose(false);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateConfig, configData, isError, error]);
  const isLoading = isCreateConfig || loading;

  return (
    <div data-testid="create-config-modal">
      <FormControl variant="standard">
        <span className="mb-2 mt-2">{getString('text.agentName')}</span>

        <Controls.Autocomplete
          data-testid="config-agent-name"
          placeholder={getString('text.pleaseSelect')}
          name="config-agent-name"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          options={agents}
          multiple={false}
        />
      </FormControl>
      <FormControl variant="standard">
        <span className="mb-2 mt-2">{getString('text.group')}</span>
        <Controls.Autocomplete
          data-testid="config-group"
          options={groupOptions}
          placeholder={getString('text.pleaseSelect')}
          name="config-group"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          multiple={false}
        />
      </FormControl>

      <FormControl variant="standard">
        <span className="mb-2 mt-2">{getString('text.date')}</span>
        <Controls.KeyBoardDatePicker
          name="config-date"
          data-testid="config-date"
          className="rounded-xl"
          value={selectedDate?.toString() as string}
          onChange={(val) => setSelectedDate(val as Date)}
          invalidDateMessage={false}
          minDateMessage={false}
          autoOk
          disableToolbar
          disablePast
          fixedLabel={false}
        />
      </FormControl>

      <Grid
        container
        className="button-group mt-6 mb-4"
        justifyContent="flex-end"
      >
        <Controls.Button
          color="secondary"
          variant="text"
          text={getString('text.close')}
          id="create-config-close"
          onClick={() => {
            setAgentName(initialAgentState);
            setGroup(initialAgentState);
            setSelectedDate(new Date());
            onClose(false);
          }}
        />
        <Controls.Button
          type="submit"
          disabled={!agentName || !group || isLoading}
          onClick={handleSubmit}
          color="primary"
          loading={isLoading}
          text={getString('text.save')}
          id="create-config-save"
        />
      </Grid>
    </div>
  );
}
