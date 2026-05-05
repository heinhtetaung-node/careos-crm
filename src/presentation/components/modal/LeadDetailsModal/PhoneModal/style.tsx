import { makeStyles } from '@material-ui/core';

const useStyle = makeStyles(() => ({
  btnGroup: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem',
    marginTop: '14px',
    '& button': {
      textTransform: 'uppercase',
    },
  },
}));

export default useStyle;
