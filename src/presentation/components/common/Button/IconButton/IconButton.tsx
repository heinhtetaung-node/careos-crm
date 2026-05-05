import MuiIconButton from '@material-ui/core/IconButton';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import capitalize from 'lodash/capitalize';
import React from 'react';

export interface IconButtonProps {
  btnSize?: 'medium' | 'large';
  iconSize?: 'xs' | 's' | 'm' | 'l' | 'xl';
  color?: 'default' | 'primary' | 'secondary';
  icon: React.ReactNode;
  handleClick?: () => void;
  isDisabled?: boolean;
  extraClass?: string;
}

const CustomIconButton = withStyles((theme) => ({
  root: {
    padding: 0,
    color: theme.palette.primary.main,
    '&:disabled': {
      color: theme.palette.grey[200],
    },
    '&:hover': {
      color: theme.palette.primary.dark,
    },
  },
  colorPrimary: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    '&:disabled': {
      color: theme.palette.common.white,
      backgroundColor: theme.palette.grey[200],
    },
    '&:hover': {
      color: theme.palette.common.white,
      backgroundColor: theme.palette.primary.dark,
    },
  },
  colorSecondary: {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.common.blue,
    '&:disabled': {
      color: theme.palette.grey[400],
      backgroundColor: theme.palette.grey[200],
    },
    '&:hover': {
      color: theme.palette.primary.dark,
      backgroundColor: '#E0E3EB',
    },
  },
}))(MuiIconButton);

export const useStyles = makeStyles(() => ({
  // Btn Medium
  xsIconBtnMedium: {
    width: 18,
    height: 18,
    '& .MuiSvgIcon-root': {
      fontSize: 12,
    },
  },
  sIconBtnMedium: {
    width: 24,
    height: 24,
    '& .MuiSvgIcon-root': {
      fontSize: 16,
    },
  },
  mIconBtnMedium: {
    width: 30,
    height: 30,
    '& .MuiSvgIcon-root': {
      fontSize: 20,
    },
  },
  lIconBtnMedium: {
    width: 36,
    height: 36,
    '& .MuiSvgIcon-root': {
      fontSize: 24,
    },
  },
  xlIconBtnMedium: {
    width: 45,
    height: 45,
    '& .MuiSvgIcon-root': {
      fontSize: 30,
    },
  },
  // Btn Large
  xsIconBtnLarge: {
    width: 24,
    height: 24,
    '& .MuiSvgIcon-root': {
      fontSize: 12,
    },
  },
  sIconBtnLarge: {
    width: 32,
    height: 32,
    '& .MuiSvgIcon-root': {
      fontSize: 16,
    },
  },
  mIconBtnLarge: {
    width: 40,
    height: 40,
    '& .MuiSvgIcon-root': {
      fontSize: 20,
    },
  },
  lIconBtnLarge: {
    width: 48,
    height: 48,
    '& .MuiSvgIcon-root': {
      fontSize: 24,
    },
  },
  xlIconBtnLarge: {
    width: 60,
    height: 60,
    '& .MuiSvgIcon-root': {
      fontSize: 30,
    },
  },
}));

function IconButton({
  icon,
  handleClick,
  iconSize = 'm',
  btnSize = 'medium',
  color,
  isDisabled = false,
  extraClass = '',
  ...rest
}: IconButtonProps) {
  const classes = useStyles();
  const classSize =
    classes[`${iconSize}IconBtn${capitalize(btnSize)}` as keyof typeof classes];
  return (
    <CustomIconButton
      color={color}
      className={clsx(classSize, extraClass)}
      onClick={handleClick}
      disabled={isDisabled}
      {...rest}
    >
      {icon}
    </CustomIconButton>
  );
}

export default IconButton;
