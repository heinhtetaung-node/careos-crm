import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';

const useStyles = makeStyles((theme) => ({
  iconContainer: {
    padding: '10px',
    '& .MuiSvgIcon-root': {
      width: '60px',
      height: '60px',
    },
  },
  title: {
    marginBottom: '10px',
    color: theme.palette.warning.main,
  },
  description: {
    marginBottom: '20px',
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

interface Props {
  logo?: React.ReactNode;
  title?: string;
  description?: React.ReactNode | string;
  button?: React.ReactNode;
}

function WarningModal({ title, logo, description, button }: Props) {
  const classes = useStyles();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      m={8}
      data-testid="warning-modal"
    >
      {logo && (
        <Box className={classes.iconContainer} data-testid="warning-modal-logo">
          {logo}
        </Box>
      )}
      {title && (
        <Typography
          variant="h4"
          className={classes.title}
          data-testid="warning-modal-title"
        >
          {title}
        </Typography>
      )}
      {description && (
        <Box
          className={classes.description}
          data-testid="warning-modal-description"
        >
          {description}
        </Box>
      )}
      {button && (
        <Box
          className={classes.buttonContainer}
          data-testid="warning-modal-button"
        >
          {button}
        </Box>
      )}
    </Box>
  );
}

export default WarningModal;
