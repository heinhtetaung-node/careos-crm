import { Grid, FormControl } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useUpdateAgentStatusMutation } from 'data/slices/autoAssignLeadSlice';
import Controls from 'presentation/components/controls/Control';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import { snackBarConfig } from 'shared/constants';
import { statusOptions } from 'shared/helper/selectOptions';

import { StatusModalProps } from '../types';

export default function AutoAssignStatusModal({
  id,
  onClose,
}: StatusModalProps) {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const [setAgentStatus, { isLoading: isStatusUpdating, isSuccess }] =
    useUpdateAgentStatusMutation();

  const handleSubmit = () => {
    const isAbsent = status === '1';

    if (id) {
      setLoading(true);
      setAgentStatus({ absent: isAbsent, id });
    } else {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('errors.selectAgent'),
          status: snackBarConfig.type.error,
        })
      );
    }
  };

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        dispatch(
          showSnackBar({
            isOpen: true,
            message: getString('menu.autoAssignment.agentStatusUpdated'),
            status: snackBarConfig.type.success,
          })
        );
        setLoading((prev) => !prev);
        onClose(true);
      }, 3000);

      return () => clearTimeout(timer);
    }

    // eslint-disable-next-line  react-hooks/exhaustive-deps
  }, [isStatusUpdating, isSuccess]);
  const isLoading = isStatusUpdating || loading;
  return (
    <div data-testid="autoassign-status-modal">
      <FormControl variant="standard">
        <span className="mb-2 mt-2">{getString('text.status')}</span>
        <Controls.Select
          value={status}
          name="autoassign-status"
          onChange={(e) => setStatus(e.target.value as string)}
          options={statusOptions}
          placeholder={getString('text.pleaseSelect')}
          title={getString('text.status')}
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
          text={getString('text.cancelButton')}
          onClick={() => {
            setStatus('');
            onClose();
          }}
        />
        <Controls.Button
          type="submit"
          disabled={status === '' || isLoading}
          onClick={handleSubmit}
          color="primary"
          loading={isLoading}
          text={getString('text.confirmChange')}
        />
      </Grid>
    </div>
  );
}
