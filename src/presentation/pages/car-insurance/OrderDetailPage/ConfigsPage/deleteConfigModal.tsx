/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Grid } from '@material-ui/core';
import { useDeleteOrderConfigMutation } from 'data/slices/orderSlice';
import Controls from 'presentation/components/controls/Control';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { snackBarConfig } from 'shared/constants';

import { ConfigImport } from './helper';

export default function DeleteConfigModal({
  id,
  onClose,
  orderConfigData,
}: {
  id: string;
  onClose: (status?: boolean) => void;
  orderConfigData?: ConfigImport;
}) {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const [deleteConfig, { isLoading: isDeleteConfig, isSuccess }] =
    useDeleteOrderConfigMutation();

  const handleSubmit = () => {
    if (id) {
      setLoading(true);
      deleteConfig({
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
  }, [isDeleteConfig, isSuccess]);

  const isLoading = isDeleteConfig || loading;

  return (
    <div data-testid="delete-config-modal">
      <p className="assign-modal__content">
        {getString('menu.orderAutoAssignmentConfigDeletePrompt', {
          agentEmail: orderConfigData?.name,
          effectiveDate: orderConfigData?.effectiveDate,
        })}
      </p>
      <Grid
        container
        className="button-group mt-6 mb-4"
        justifyContent="flex-end"
      >
        <Controls.Button
          color="secondary"
          variant="text"
          text={getString('text.close')}
          id="delete-config-close"
          onClick={() => {
            onClose(false);
          }}
        />
        <Controls.Button
          type="submit"
          disabled={isLoading}
          onClick={handleSubmit}
          color="primary"
          loading={isLoading}
          text={getString('menu.orderAutoAssignmentConfigDelete')}
        />
      </Grid>
    </div>
  );
}
