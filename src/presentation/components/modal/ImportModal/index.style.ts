import { makeStyles } from '@material-ui/core/styles';

const useStyle = makeStyles((theme) => ({
  center: {
    display: 'flex',
    justifyContent: 'center',
    padding: '30px 0',
  },
  cancelBtn: {
    border: 'solid 1px',
    borderColor: theme.palette.primary.main,
  },
  validation: {
    textAlign: 'left',
    padding: '0 0 0 20px',
  },
  inProgressImage: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    backgroundColor: '#e0e0e0',
    marginBottom: 20,
  },
  inProgressContainer: {
    padding: '70px 0',
  },
  fileContainer: {
    display: 'flex',
    padding: '24px 0 0',
  },
  title: {
    whiteSpace: 'nowrap',
    textAlign: 'left',
    color: 'black',
  },
  value: {
    textAlign: 'left',
    color: '#5fb15c',
  },
  failureText: {
    textAlign: 'left',
    margin: '24px 0 5px',
    color: 'red',
  },
}));

export default useStyle;
