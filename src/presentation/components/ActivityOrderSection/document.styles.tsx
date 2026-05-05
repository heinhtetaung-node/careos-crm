import { makeStyles, withStyles } from '@material-ui/core';

export const useFieldStyleSheet = makeStyles((theme) => ({
  root: {
    // fontSize: '0.75rem',
    display: ' flex',
    lineHeight: '1.125rem',
    padding: '10px',
    alignItems: 'center',
    flexWrap: 'wrap',
    background: `${theme.palette.common.white}`,
    borderBottom: `${theme.outline.primary.border1}`,
    '& p': {
      margin: 0,
    },
  },
  otherFieldRoot: {
    padding: '10px 0 0',
    borderBottom: 0,
  },
  otherFiled: {
    display: 'flex',
    flexBasis: '100%',
  },
  file: {
    color: `${theme.palette.common.sky}`,
  },
  noFile: {
    color: `${theme.palette.grey[800]}`,
  },
  actionButtons: {
    marginLeft: 'auto',
    '& .MuiFab-root:not(:last-child)': {
      marginRight: '10px',
    },
  },
  dropZone: {
    cursor: 'pointer',
    color: `${theme.palette.grey[400]}`,
  },
  descriptionLength: {
    color: `${theme.palette.grey[400]}`,
  },
  descriptionError: {
    color: `${theme.palette.error.main}`,
  },
  chooseFile: {
    color: `${theme.palette.common.sky}`,
  },
}));

export const ButtonStyleSheet = withStyles((theme) => ({
  root: {
    minHeight: '32px',
    marginRight: '0.25rem',
    backgroundColor: `${theme.palette.grey[100]}`,
    '&.Mui-disabled': {
      backgroundColor: `${theme.palette.grey[100]}`,
    },
  },
  disabled: {
    '& .MuiSvgIcon-root': {
      fill: `${theme.palette.grey[400]}`,
    },
  },
  sizeSmall: {
    width: '32px',
    height: '32px',
    '& .MuiSvgIcon-fontSizeSmall': {
      fontSize: '1rem',
    },
  },
}));
