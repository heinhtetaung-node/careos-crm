import { Button as MuiButton } from '@material-ui/core';
import {
  withStyles,
  createStyles,
  makeStyles,
  alpha,
} from '@material-ui/core/styles';

export const Button = withStyles((theme) => ({
  root: {
    fontWeight: theme.typography.h6.fontWeight,
    borderRadius: '10px',
    '&.MuiButton-contained': {
      '&:disabled': {
        backgroundColor: `${theme.palette.grey[100]}`,
      },
    },
    '&.MuiButton-outlined': {
      '&:disabled': {
        border: `1px solid ${theme.palette.grey[100]}`,
      },
    },
    '&:disabled': {
      color: theme.palette.text.secondary,
    },
  },
}))(MuiButton);

export const useStyles = makeStyles((theme) =>
  createStyles({
    outlinedSuccess: {
      border: `1px solid ${theme.palette.success.main}`,
      color: theme.palette.success.main,
      backgroundColor: 'unset',
      '&:hover:not([disabled])': {
        color: theme.palette.success.dark,
        border: `1px solid ${theme.palette.success.dark}`,
        backgroundColor: alpha(theme.palette.success.main, 0.04),
      },
    },
    outlinedError: {
      border: `1px solid ${theme.palette.error.main}`,
      color: theme.palette.error.main,
      backgroundColor: 'unset',
      '&:hover:not([disabled])': {
        color: theme.palette.error.dark,
        border: `1px solid ${theme.palette.error.dark}`,
        backgroundColor: alpha(theme.palette.error.main, 0.04),
      },
    },
    outlinedPrimary: {
      border: `1px solid ${theme.palette.primary.main}`,
      color: theme.palette.primary.main,
      backgroundColor: 'unset',
      '&:hover:not([disabled])': {
        color: theme.palette.primary.dark,
        border: `1px solid ${theme.palette.primary.dark}`,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
    },
    textSuccess: {
      color: theme.palette.success.main,
      backgroundColor: 'unset',
      '&:hover:not([disabled])': {
        backgroundColor: alpha(theme.palette.success.main, 0.04),
      },
    },
    textError: {
      color: theme.palette.error.main,
      backgroundColor: 'unset',
      '&:hover:not([disabled])': {
        backgroundColor: alpha(theme.palette.error.main, 0.04),
      },
    },
    textPrimary: {
      color: theme.palette.primary.main,
      backgroundColor: 'unset',
      '&:hover:not([disabled])': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
    },
    containedSuccess: {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.common.white,
      '&:hover:not([disabled])': {
        backgroundColor: theme.palette.success.dark,
      },
    },
    containedError: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.common.white,
      '&:hover:not([disabled])': {
        backgroundColor: theme.palette.error.dark,
      },
    },
    containedPrimary: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      '&:hover:not([disabled])': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  })
);
