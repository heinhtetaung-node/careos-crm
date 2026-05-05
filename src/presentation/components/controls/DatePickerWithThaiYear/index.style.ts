import { makeStyles } from '@material-ui/core';

export default makeStyles((theme) => ({
  disabled: {
    paddingTop: '.2rem',
  },
  fieldItem: {
    display: 'flex',
    alignItems: 'center',
  },
  calendarIcon: {
    color: theme.palette.primary.main,
    '&.Mui-disabled': {
      opacity: 0.5,
    },
  },
}));
