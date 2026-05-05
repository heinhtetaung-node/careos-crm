import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    lineHeight: '20px',
    '& .MuiTypography-root': {
      lineHeight: '20px',
    },
    '&:last-child': {
      borderBottom: 'none',
    },
    '&.error': {
      borderLeft: `2px solid ${theme.palette.error.main}`,
      '& .MuiFormHelperText-root': {
        marginTop: 0,
        padding: 10,
      },
    },
    '&.disabled *': {
      color: `${theme.palette.grey[400]} !important`,
      '& .MuiSvgIcon-root': {
        fill: `${theme.palette.grey[200]} !important`,
      },
    },
    '& .readonly-icon': {
      position: 'absolute',
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      borderWidth: '0 10px 10px 0',
      borderColor: `transparent ${theme.palette.grey[200]} transparent transparent`,
      borderStyle: 'solid',
    },
  },
  label: {
    padding: 10,
  },
  colon: {
    display: 'flex',
    justifyContent: 'center',
  },
  removeIcon: {
    marginRight: 10,
  },
  flex: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export const sectionTitleStyles = (theme: Theme) =>
  createStyles({
    root: {
      fontWeight: 600,
      fontSize: '0.875rem',
      color: theme.palette.grey[800],
      margin: 0,
    },
  });

export default useStyles;
