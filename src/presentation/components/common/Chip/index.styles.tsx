import { Chip as MuiChip } from '@material-ui/core';
import {
  withStyles,
  createStyles,
  makeStyles,
  alpha,
} from '@material-ui/core/styles';
import { CreateCSSProperties } from '@material-ui/styles';

const chipDeleteIconColor = (
  color: string,
  isStrongAlpha = false
): CreateCSSProperties => ({
  color: alpha(color, !isStrongAlpha ? 0.26 : 0.7),
  '&:hover': {
    color: alpha(color, !isStrongAlpha ? 0.4 : 1),
  },
});

const chipClickableHoverFocus = (color: string): CreateCSSProperties => ({
  '&:hover,&:focus': {
    backgroundColor: color,
  },
  '&:active': {
    boxShadow: 'none',
  },
});

export const ChipStyle = withStyles((theme) => ({
  root: {
    lineHeight: '16px',
    '&.Mui-disabled': {
      border: 'none',
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.grey[400],
      '&:focus': {
        backgroundColor: theme.palette.grey[100],
      },
    },
    '&:focus': {
      backgroundColor: theme.palette.grey[200],
    },
  },
  label: {
    fontSize: theme.typography.pxToRem(11),
  },
  deleteIcon: {
    color: alpha(theme.palette.common.white, 0.7),
    '&:hover': {
      color: theme.palette.common.white,
    },
  },
  outlined: {
    color: theme.palette.grey[800],
    borderColor: theme.palette.grey[400],
    '&:focus': {
      backgroundColor: theme.palette.common.white,
    },
    '& .MuiChip-deleteIcon': chipDeleteIconColor(theme.palette.common.black),
    '&.Mui-disabled': {
      border: `1px solid ${theme.palette.grey[200]}`,
      backgroundColor: theme.palette.common.white,
      color: theme.palette.grey[400],
      '&:focus': {
        backgroundColor: theme.palette.common.white,
      },
    },
  },
  disabled: {
    '& .MuiChip-deleteIcon': chipDeleteIconColor(theme.palette.common.black),
    '&.MuiChip-deletable.MuiChip-outlined:focus': {
      backgroundColor: theme.palette.grey[100],
    },
  },
  deletable: {
    '&.MuiChip-outlined:focus': {
      backgroundColor: theme.palette.common.white,
    },
  },
  clickable: chipClickableHoverFocus(theme.palette.grey[200]),
}))(MuiChip);

interface ChipStyleProps {
  fontSize: number;
}

export const useStyles = makeStyles((theme) =>
  createStyles({
    default: {
      backgroundColor: theme.palette.grey[200],
      color: theme.palette.grey[800],
      '& .MuiChip-deleteIcon': chipDeleteIconColor(theme.palette.common.black),
      '&:focus': {
        backgroundColor: theme.palette.grey[200],
      },
      '& .MuiChip-label': {
        fontSize: (props: ChipStyleProps) =>
          theme.typography.pxToRem(props.fontSize),
      },
    },
    defaultPrimary: {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.common.white,
      '&:focus': {
        backgroundColor: theme.palette.primary.main,
      },
      '&.MuiChip-clickable': {
        '&:hover,&:focus': {
          backgroundColor: theme.palette.primary.light,
        },
      },
      '& .MuiChip-label': {
        fontSize: (props: ChipStyleProps) =>
          theme.typography.pxToRem(props.fontSize),
      },
    },
    defaultWhite: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.primary.main,
      '& .MuiChip-deleteIcon': chipDeleteIconColor(theme.palette.primary.main),
      '&:focus': {
        backgroundColor: theme.palette.common.white,
      },
      '&.MuiChip-clickable': chipClickableHoverFocus(
        theme.palette.common.white
      ),
      '& .MuiChip-label': {
        fontSize: (props: ChipStyleProps) =>
          theme.typography.pxToRem(props.fontSize),
      },
    },
    defaultSuccess: {
      backgroundColor: theme.palette.success.main,
      color: theme.palette.common.white,
      '&:focus': {
        backgroundColor: theme.palette.success.main,
      },
      '&.MuiChip-clickable': chipClickableHoverFocus(
        theme.palette.success.light
      ),
      '& .MuiChip-label': {
        fontSize: (props: ChipStyleProps) =>
          theme.typography.pxToRem(props.fontSize),
      },
    },
    defaultDanger: {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.common.white,
      '&:focus': {
        backgroundColor: theme.palette.error.main,
      },
      '&.MuiChip-clickable': chipClickableHoverFocus(theme.palette.error.light),
    },
    outlinedWhite: {
      color: theme.palette.grey[800],
      borderColor: theme.palette.grey[400],
      '& .MuiChip-deleteIcon': chipDeleteIconColor(theme.palette.common.black),
      '&:hover,&:focus': {
        backgroundColor: theme.palette.common.white,
      },
      '& .MuiChip-label': {
        fontSize: (props: ChipStyleProps) =>
          theme.typography.pxToRem(props.fontSize),
      },
    },
    outlinedPrimary: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
      '& .MuiChip-deleteIcon': chipDeleteIconColor(
        theme.palette.primary.main,
        true
      ),
      '& .MuiChip-label': {
        fontSize: (props: ChipStyleProps) =>
          theme.typography.pxToRem(props.fontSize),
      },
      '&.MuiChip-clickable': {
        '&:hover,&:focus': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
      },
    },
    outlinedSuccess: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.success.main,
      borderColor: theme.palette.success.main,
      '& .MuiChip-deleteIcon': chipDeleteIconColor(
        theme.palette.success.main,
        true
      ),
      '& .MuiChip-label': {
        fontSize: (props: ChipStyleProps) =>
          theme.typography.pxToRem(props.fontSize),
      },
      '&.MuiChip-clickable': {
        '&:hover,&:focus': {
          backgroundColor: alpha(theme.palette.success.main, 0.04),
        },
      },
    },
    outlinedDanger: {
      backgroundColor: theme.palette.common.white,
      color: theme.palette.error.main,
      borderColor: theme.palette.error.main,
      '& .MuiChip-deleteIcon': chipDeleteIconColor(
        theme.palette.error.main,
        true
      ),
      '& .MuiChip-label': {
        fontSize: (props: ChipStyleProps) =>
          theme.typography.pxToRem(props.fontSize),
      },
      '&.MuiChip-clickable': {
        '&:hover,&:focus': {
          backgroundColor: alpha(theme.palette.error.main, 0.04),
        },
      },
    },
  })
);
