/* eslint-disable import/prefer-default-export */
import { makeStyles } from '@material-ui/core/styles';

export const useFormStyles = makeStyles(() => ({
  root: {
    '& .input + .input': {
      marginTop: '30px',
    },
  },
}));
