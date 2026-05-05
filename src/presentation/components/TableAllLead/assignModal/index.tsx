import { Grid } from '@material-ui/core';
import CropOriginalIcon from '@material-ui/icons/CropOriginal';
import React from 'react';
import { getI18n } from 'react-i18next';

import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';

import { TypeAssign } from '../TableAllLead.helper';

import './assignModal.scss';

interface AssignModalProps {
  closeModal: (payload: boolean) => void;
  type: string;
  quantity: number;
  handleConfirm: (val: string) => void;
  typeAssign?: string;
  loading?: boolean;
}

function AssignModal({
  closeModal,
  type,
  quantity,
  handleConfirm,
  typeAssign,
  loading = false,
}: Readonly<AssignModalProps>) {
  const handleConfirmAssignLead = (assignType: string) => {
    handleConfirm(assignType);
  };

  const handleCloseModal = (status: boolean) => {
    closeModal(status);
  };

  let assignText: string;
  if (typeAssign === 'policy') {
    assignText =
      quantity < 2
        ? getString(`text.policyAssign`)
        : getString(`text.policiesAssign`);
  } else if (typeAssign === 'followup') {
    assignText = getString(
      type === TypeAssign.ASSIGN
        ? 'text.followupAssign'
        : 'text.followupUnAssign',
      { count: quantity }
    );
  } else {
    assignText =
      quantity < 2
        ? getString(`text.${typeAssign}Assign`)
        : getString(`text.${typeAssign}sAssign`);
  }

  return (
    <Grid container xs={12} md={12} lg={12} className="assign-modal">
      <Grid item xs={12} md={12} lg={12} className="assign-modal__icon-wrapper">
        <CropOriginalIcon />
      </Grid>
      <p className="assign-modal__content -ml-5 -mr-5">
        {`${getString('text.doYouWantTo')} ${
          type === TypeAssign.ASSIGN
            ? getString('text.assign')
            : getString('text.unassign')
        }`}
        {typeAssign === 'followup'
          ? getI18n()?.language === 'th' && <br />
          : ` ${quantity}`}
        {` ${assignText}?`}
      </p>
      <Grid item xs={12} md={12} lg={12} className="assign-modal__btn">
        <Controls.Button
          data-testid="assign-close-button"
          text={getString('text.cancelButton')}
          color="primary"
          className="button"
          disabled={loading}
          onClick={() => handleCloseModal(false)}
          role="button"
        />
        <Controls.Button
          data-testid="assign-confirm-button"
          text={getString('text.confirmButton')}
          color="primary"
          onClick={() => handleConfirmAssignLead(type)}
          loading={loading}
          disabled={loading}
          className="button h-full"
          data-cy="button-assign-handle"
          role="button"
        />
      </Grid>
    </Grid>
  );
}
export default AssignModal;
