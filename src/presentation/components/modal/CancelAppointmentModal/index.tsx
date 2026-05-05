import { Grid, Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import React, { useState } from 'react';

import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';

interface CancelAppointmentModalProps {
  handleOpenCloseModal: () => void;
  handleRemoveAppointment: () => Promise<void>;
}

const useStyles = makeStyles({
  modalContainer: {
    alignItems: 'center',
    flexDirection: 'column',
    padding: '50px',
  },
  controlButton: {
    textTransform: 'uppercase',
  },
  buttonContainer: {
    display: 'flex',
    marginRight: '38px',
  },
});

export default function CancelAppointmentModal({
  handleOpenCloseModal,
  handleRemoveAppointment,
}: CancelAppointmentModalProps) {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const handleClickYes = async () => {
    setLoading(true);
    try {
      await handleRemoveAppointment();
    } finally {
      setLoading(false);
    }
  };
  return (
    <Grid className={classes.modalContainer} container xs={12} md={12} lg={12}>
      <Box fontSize={20} fontWeight={700} mt={3} mb={3} sx={{ width: 400 }}>
        {getString('timeSlotCallBack.cancelAppointmentModal')}
      </Box>
      <Grid className={classes.buttonContainer} item xs={12} md={12} lg={12}>
        <Controls.Button
          className={classes.controlButton}
          text={getString('text.no')}
          variant="outlined"
          color="secondary"
          onClick={handleOpenCloseModal}
        />
        <Controls.Button
          className={clsx(classes.controlButton, 'h-full')}
          text={getString('text.yes')}
          loading={loading}
          color="primary"
          onClick={handleClickYes}
        />
      </Grid>
    </Grid>
  );
}
