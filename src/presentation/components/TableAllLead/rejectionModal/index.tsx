/* eslint-disable react/function-component-definition */
import { Grid, makeStyles } from '@material-ui/core';
import React from 'react';

import Controls from 'presentation/components/controls/Control';
import { LeadImportDefault } from 'presentation/components/icons';
import { getString } from 'presentation/theme/localization';

import { RejectionType } from '../TableRejectionLead.helper';

export const useStyles = makeStyles(() => ({
  root: {
    padding: '100px 50px',
  },
  wrapper: {
    display: 'flex',
    borderRadius: '50%',
    width: '100px',
    height: '100px',
    justifyContent: 'center',
    alignItems: 'center',
    flexBasis: 'auto !important',
  },
  icon: {
    fontSize: '50px',
    color: '#969696',
  },
  text: {
    fontSize: '20px',
    fontWeight: 700,
  },
}));

interface IProps {
  closeModal: (payload: boolean) => void;
  type: string;
  quantity: number;
  handleConfirm: (val: string) => void;
  buttonLoading: boolean;
}

const LeadRejectionModal: React.FC<IProps> = ({
  closeModal,
  type,
  quantity,
  handleConfirm,
  buttonLoading,
}) => {
  const classes = useStyles();
  const handleConfirmApproveLead = (rejectionType: string) => {
    handleConfirm(rejectionType);
  };

  const handleCloseModal = (status: boolean) => {
    closeModal(status);
  };

  return (
    <Grid
      container
      xs={12}
      md={12}
      lg={12}
      direction="column"
      alignItems="center"
      classes={{ root: classes.root }}
    >
      <Grid item xs={12} md={12} lg={12} classes={{ root: classes.wrapper }}>
        <LeadImportDefault />
      </Grid>
      <p className={classes.text}>
        {`Do you want ${
          type === RejectionType.APPROVE ? 'approve' : 'decline'
        } ${quantity} ${quantity < 2 ? 'lead' : 'leads'} ?`}
      </p>
      <Grid container justifyContent="center" xs={12} md={12} lg={12}>
        <Controls.Button
          text={getString('text.cancelButton')}
          color="primary"
          className="button"
          onClick={() => handleCloseModal(false)}
          disabled={buttonLoading}
          data-testid="rejection-modal-cancel-btn"
        />
        <Controls.Button
          text={getString('text.confirmButton')}
          color="primary"
          onClick={() => handleConfirmApproveLead(type)}
          className="button"
          loading={buttonLoading}
          disabled={buttonLoading}
          data-testid="rejection-modal-confirm-btn"
        />
      </Grid>
    </Grid>
  );
};
export default LeadRejectionModal;
