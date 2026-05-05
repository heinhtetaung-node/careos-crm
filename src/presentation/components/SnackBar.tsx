import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import React, { useCallback } from 'react';

import {
  useAppDispatch,
  useAppSelector,
} from 'presentation/redux/hooks/typedHooks';
import * as CONSTANTS from 'shared/constants';

import { hideSnackBar } from '../redux/actions/ui';

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function SnackbarComponent() {
  const dispatch = useAppDispatch();

  const { isSnackbarOpen, snackbarMessage, snackBarStatus, isNotClose } =
    useAppSelector((state) => state.uiInitReducer);

  const handleClose = useCallback(() => {
    dispatch(hideSnackBar());
  }, [dispatch]);

  return (
    <Snackbar
      open={isSnackbarOpen}
      autoHideDuration={isNotClose ? null : CONSTANTS.snackBarConfig.duration}
      onClose={handleClose}
      className="whitespace-pre-line"
    >
      <Alert
        onClose={handleClose}
        severity={snackBarStatus}
        className="cypress-alert"
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
}
