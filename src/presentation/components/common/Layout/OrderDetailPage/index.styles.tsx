import { Grid as MuiGrid, withStyles, makeStyles } from '@material-ui/core';

export const Grid = withStyles((theme) => ({
  root: {
    '& .MuiButton-outlinedPrimary': {
      border: `1px solid ${theme.palette.info.main}`,
    },
  },
}))(MuiGrid);

export const useDetailPageStyles = makeStyles((theme) => ({
  orderDetailPage: {
    backgroundColor: `${theme.palette.common.white}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    padding: '10px',
    '& .order-detail-page__boards': {
      padding: '10px',
      '& .order-detail-page__boards__activity': {
        paddingLeft: '10px',
        [theme.breakpoints.down('md')]: {
          paddingTop: '20px',
          paddingLeft: 0,
        },
        [theme.breakpoints.up('xl')]: {
          paddingTop: '10px',
          paddingLeft: 0,
        },
      },
      '& .order-detail-page__boards__item': {
        '&:not(:first-child)': {
          paddingLeft: '10px',
        },
        '&:last-child': {
          paddingRight: '10px',
        },
        '& input': {
          paddingTop: '3px !important',

          '&:not([readOnly])': {
            border: `1px solid ${theme.palette.info.main}`,
            borderRadius: '6px',
            boxSizing: 'border-box',
            padding: '3px 8px',
            height: '26px',
            background: `${theme.palette.common.white}`,
            minWidth: '55px',
            marginLeft: '5px',
            '&:hover,&:focus': {
              transition: '0.2s',
              border: `1px solid ${theme.palette.info.dark}`,
              boxShadow: '0 7px 15px 0 #2a31cb1a',
            },
          },
        },
      },
    },
  },
}));
