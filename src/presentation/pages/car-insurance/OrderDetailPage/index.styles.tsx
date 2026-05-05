import { Grid, withStyles, makeStyles } from '@material-ui/core';

export const GridBoardItem = withStyles((theme) => ({
  root: {
    [theme.breakpoints.up('md')]: {
      '&:not(:first-child)': {
        paddingLeft: '10px',
      },
    },
    [theme.breakpoints.down('sm')]: {
      minHeight: '650px',
      '&:not(:first-child)': {
        paddingTop: `${theme.spacing(5)}px`,
      },
    },
    '& input': {
      paddingTop: '3px !important',

      '&:not([readOnly])': {
        border: `${theme.outline.primary.border1}`,
        borderRadius: `${theme.boardItem.input.borderRadius}`,
        boxSizing: 'border-box',
        padding: `3px ${theme.spacing(2)}px`,
        height: `${theme.boardItem.input.height}`,
        background: `${theme.palette.common.white}`,
        minWidth: '55px',
        marginLeft: '5px',
        '&:hover,&:focus': {
          transition: '0.2s',
          border: `${theme.outline.sencondary.border1}`,
          boxShadow: `${theme.effects.shadow2}`,
        },
      },
    },
    '& .MuiInputAdornment-positionEnd': {
      marginLeft: 0,
      '& .MuiIconButton-root': {
        padding: `${theme.spacing(2)}px`,
      },
    },
    '& .container-datepicker': {
      '& .MuiInputBase-formControl': {
        border: `1px solid ${theme.palette.common.blue}`,
        borderRadius: `${theme.boardItem.input.borderRadius}`,
        boxSizing: 'border-box',
        padding: `3px ${theme.spacing(4)}px`,
        height: '30px',
        background: `${theme.palette.common.white}`,

        '& input': {
          border: 'none',
          height: `${theme.boardItem.input.height} !important`,

          '&:hover, &:focus': {
            border: 'none',
            boxShadow: 'none',
          },
        },
      },
      '& .calendar-icon': {
        marginRight: '5px',
      },
    },
    '& .shared-select': {
      '#mui-component-select-preferredInsurer': {
        padding: '12.5px',
      },
    },
  },
}))(Grid);

export const useDetailPageStyles = makeStyles((theme) => ({
  leadDetailPage: {
    backgroundColor: `${theme.palette.common.white}`,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingTop: '10px',
    '& .shared-button': {
      marginLeft: 0,
      '&__matbutton': {
        minHeight: '40px',
      },
    },
    '& .Mui-error': {
      input: {
        border: `${theme.outline.error.border1}`,
      },
    },

    '& .lead-detail-page__boards': {
      padding: '10px',
      '& .lead-detail-page__boards__activity': {
        paddingTop: '20px',
        paddingLeft: 0,
        [theme.breakpoints.up('lg')]: {
          paddingTop: 0,
          paddingLeft: '30px',
        },
      },
    },
  },
}));
