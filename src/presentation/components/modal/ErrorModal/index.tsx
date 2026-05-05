import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import * as Icon from '@material-ui/icons';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  errorIconWrapper: {
    borderRadius: '50%',
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
  },
  errorBg: {
    background: theme.palette.error.main,
    opacity: 0.2,
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: 0,
    right: 0,
  },
  errorIcon: {
    color: theme.palette.error.main,
  },
}));

interface Props {
  close: () => void;
  errorTitle: string;
  errorMsg?: string;
}

function ErrorModal({ close, errorTitle, errorMsg }: Props) {
  const classes = useStyles();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      m={8}
      data-testid="error-modal"
    >
      <Box
        className={classes.errorIconWrapper}
        sx={{ p: 3, mb: '10px' }}
        onClick={close}
      >
        <Box className={classes.errorBg} />
        <Icon.Close className={classes.errorIcon} />
      </Box>
      <Typography variant="h4" gutterBottom>
        {errorTitle}
      </Typography>
      {errorMsg && errorMsg.length ? (
        <Typography align="center">{errorMsg}</Typography>
      ) : null}
    </Box>
  );
}

export default ErrorModal;
