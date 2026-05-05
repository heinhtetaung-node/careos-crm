import {
  Paper as MuiPaper,
  TextField as MuiTextField,
  Typography as MuiTypography,
  IconButton as MuiIconButton,
  Radio as MuiRadio,
  withStyles,
  makeStyles,
} from '@material-ui/core';

export const Paper = withStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.grey[200]}`,
    borderRadius: '6px',
  },
}))(MuiPaper);

export const Typography = withStyles((theme) => ({
  root: {
    fontFamily: theme.typography.fontFamily,
  },
}))(MuiTypography);

export const PanelHeader = withStyles((theme) => ({
  root: {
    margin: 0,
    padding: '10px 15px',
    color: theme.palette.primary.main,
    fontSize: '16px',
  },
}))(MuiTypography);

export const LicenseProvince = withStyles((theme) => ({
  root: {
    color: theme.palette.grey[800],
    fontSize: theme.typography.body1.fontSize,
    fontFamily: theme.typography.fontFamily,
    backgroundColor: theme.palette.grey[200],
    borderRadius: `${theme.spacing(0.5)}px`,
    padding: `0 ${theme.spacing(1)}px`,
    display: 'flex',
    alignItems: 'center',
  },
}))(MuiTypography);

export const IconButton = withStyles(() => ({
  root: {
    padding: '1px',
    '&:hover': {
      backgroundColor: 'unset',
    },
  },
}))(MuiIconButton);

export const TextField = withStyles(() => ({
  root: {
    '& input': {
      padding: '0 10px',
      border: 'none',
    },
  },
}))(MuiTextField);

export const Radio = withStyles((theme) => ({
  root: {
    color: theme.palette.grey[200],
  },
}))(MuiRadio);

export const useStyles = makeStyles((theme) => ({
  panelHeader: {
    height: '42px',
    background: theme.palette.grey[200],
    borderRadius: '6px 6px 0 0',
  },
  panelContentWrapper: {
    padding: '8px 10px',
    borderBottom: `1px solid ${theme.palette.grey[200]}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  panelSelectField: {
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    '&& .MuiTypography-caption': {
      padding: '8px 10px',
      fontSize: theme.typography.body1.fontSize,
    },
    '&& .MuiSelect-select': {
      border: '1px solid white',
      height: 'inherit',
      padding: '9px 10px',
      '&:focus': {
        backgroundColor: 'unset',
        border: '1px solid white',
      },
      '&:hover': {
        boxShadow: 'unset',
        border: '1px solid white',
      },
    },
  },
  panelTextContent: {
    fontWeight: 'bold',
    padding: 10,
  },
  panelReadOnlyContent: {
    padding: '0 10px',
  },
  panelValueWrapper: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  licenseReadOnly: {
    marginRight: '2px',
    padding: '0 10px',
  },
  licenseContent: {
    paddingLeft: '10px',
  },
  helperText: {
    color: theme.palette.error.main,
  },
  radioField: {
    '&& .Mui-checked': {
      color: theme.palette.primary.main,
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    '& .MuiInputBase-root .MuiSelect-select': {
      border: 'unset !important',
    },
  },
}));
