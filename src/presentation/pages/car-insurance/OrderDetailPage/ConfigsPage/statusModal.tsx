import { Grid, FormControl } from '@material-ui/core';
import { useUpdateOrderConfigStatusMutation } from 'data/slices/orderSlice';
import Controls from 'presentation/components/controls/Control';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { snackBarConfig } from 'shared/constants';
import { statusOptions } from 'shared/helper/selectOptions';

import { StatusModalProps } from 'presentation/pages/admin/AutoAssign/Configs/types';

export default function StatusModal({ id, onClose }: StatusModalProps) {
  const [isAbsent, setIsAbsent] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const [updateConfigStatus, { isLoading: isStatusUpdating, isSuccess }] =
    useUpdateOrderConfigStatusMutation();

  const handleSubmit = () => {
    if (id) {
      setLoading(true);
      updateConfigStatus({
        absent: isAbsent === '1',
        id: id.split('/')[1],
      });
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
    <div data-testid="config-status-modal">
      <FormControl variant="standard">
        <span className="mb-2 mt-2">{getString('text.status')}</span>
        <Controls.Select
          value={isAbsent}
          name="config-status"
          onChange={(e) => setIsAbsent(e.target.value as string)}
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
            setIsAbsent('');
            onClose();
          }}
        />
        <Controls.Button
          type="submit"
          disabled={isAbsent === '' || isLoading}
          onClick={handleSubmit}
          color="primary"
          loading={isLoading}
          text={getString('text.confirmChange')}
        />
      </Grid>
    </div>
  );
}
