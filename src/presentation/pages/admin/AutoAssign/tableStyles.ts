import { makeStyles } from '@material-ui/core/styles';

const useTableStyles = makeStyles({
  controlBtn: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  btnGroup: {
    display: 'flex',
    marginLeft: '56px',
    '& button': {
      textTransform: 'uppercase',
    },
  },
  table: {
    '& .MuiTableCell-root.MuiTableCell-body': {
      '&:nth-child(1)': {
        textAlign: 'center',
      },
      '&:nth-child(2)': {
        width: '200px',
        maxWidth: '200px',
      },
      '&:nth-child(3)': {
        width: '200px',
        maxWidth: '200px',
      },
    },
  },
  import: {
    '& .MuiCard-root': { width: '100%' },
    '& .MuiCardContent-root': { padding: '16px 0' },
    '& .paging': {
      float: 'right',
      margin: '20px 0',
    },
  },
});

export default useTableStyles;
