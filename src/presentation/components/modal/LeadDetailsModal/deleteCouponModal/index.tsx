import { Grid } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import React from 'react';
import { useDispatch } from 'react-redux';

import { useDeleteCouponMutation } from 'data/slices/leadDetailSlices/couponSlice';
import Controls from 'presentation/components/controls/Control';
import { showSnackBar } from 'presentation/redux/actions/ui';
import { getString } from 'presentation/theme/localization';
import * as CONSTANTS from 'shared/constants';
import { getLeadIdFromPath } from 'shared/helper/utilities';
import './index.scss';

interface DeleteCouponModalProps {
  closeModal: (payload: boolean) => void;
}

function DeleteCouponModal({ closeModal }: DeleteCouponModalProps) {
  const dispatch = useDispatch();
  const [deleteCoupon, { isLoading }] = useDeleteCouponMutation();

  const handleSubmit = async () => {
    const response = await deleteCoupon(getLeadIdFromPath());
    if ('error' in response) {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: (response.error as any).data.message,
          status: CONSTANTS.snackBarConfig.type.error,
        })
      );
    } else {
      dispatch(
        showSnackBar({
          isOpen: true,
          message: getString('text.deleteCouponSuccess'),
          status: CONSTANTS.snackBarConfig.type.success,
        })
      );
    }
  };

  const handleCloseModal = (status: boolean) => {
    closeModal(status);
  };

  return (
    <Grid container className="assign-modal">
      <Grid item xs={12} md={12} lg={12} className="assign-modal__icon-wrapper">
        <DeleteIcon fontSize="small" />
      </Grid>
      <p className="assign-modal__content">
        {getString('text.deleteCouponModal')}
      </p>
      <Grid item xs={12} md={12} lg={12} className="assign-modal__btn">
        <Controls.Button
          text={getString('text.cancelButton')}
          color="secondary"
          className="button"
          onClick={() => handleCloseModal(false)}
        />
        <Controls.Button
          text={getString('text.confirmButton')}
          color="primary"
          loading={isLoading}
          disabled={isLoading}
          onClick={() => handleSubmit()}
          className="button"
        />
      </Grid>
    </Grid>
  );
}
export default DeleteCouponModal;
