/* eslint-disable import/prefer-default-export */
import { createStyles, Theme, alpha } from '@material-ui/core/styles';

export const CommonButtonStyles = (theme: Theme) =>
  createStyles({
    root: {
      borderRadius: '10px',
      '&.MuiButton-containedPrimary.Mui-disabled .MuiButton-label': {
        color: theme.palette.grey[400],
      },
    },
    contained: {
      color: theme.palette.common.white,
      backgroundColor: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
      '&.Mui-disabled': {
        color: `${theme.palette.grey[400]} !important`,
        backgroundColor: theme.palette.grey[100],
      },
    },
    containedPrimary: {
      backgroundColor: theme.palette.success.main,
      '&:hover': {
        backgroundColor: theme.palette.success.dark,
      },
    },
    containedSecondary: {
      backgroundColor: theme.palette.error.main,
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
      },
    },
    outlined: {
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
      '&:hover': {
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
      '&.Mui-disabled': {
        borderColor: theme.palette.grey[100],
        color: theme.palette.grey[400],
      },
    },
    outlinedPrimary: {
      '&:hover': {
        borderColor: theme.palette.success.main,
        backgroundColor: alpha(theme.palette.success.main, 0.04),
      },
      color: theme.palette.success.main,
      borderColor: theme.palette.success.main,
    },
    outlinedSecondary: {
      '&:hover': {
        borderColor: theme.palette.error.main,
        backgroundColor: alpha(theme.palette.error.main, 0.04),
      },
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
    },
    text: {
      color: theme.palette.primary.main,
      '&.Mui-disabled': {
        color: theme.palette.grey[400],
      },
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
    },
    textPrimary: {
      color: theme.palette.success.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.success.main, 0.04),
      },
    },
    textSecondary: {
      color: theme.palette.error.main,
      '&:hover': {
        backgroundColor: alpha(theme.palette.error.main, 0.04),
      },
    },
  });
