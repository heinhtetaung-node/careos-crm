import {
  alpha,
  Box,
  Button as MuiButton,
  CircularProgress,
  makeStyles,
} from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import './index.scss';

const useStyles = makeStyles((theme) => ({
  containedDanger: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.danger.main,
    '&:disabled': {
      color: theme.palette.common.white,
      backgroundColor: theme.palette.grey[300],
    },
    '&:hover': {
      backgroundColor: alpha(theme.palette.danger.main, 0.8),
    },
  },
}));

function Button({
  loading = false,
  children = '',
  text = '',
  style = {},
  size = 'large',
  variant = 'contained',
  color = 'default',
  onClick = () => {},
  disabled = false,
  active = false,
  icon,
  ...rest
}: any & {
  text?: string;
  loading?: boolean;
  children?: any;
  style?: any;
  size?: string;
  variant?: string;
  color?: string;
  onClick?: any;
  active: boolean;
  disabled?: boolean;
}): JSX.Element {
  const activeClass = active
    ? `shared-button__matbutton ${rest.className} active`
    : `shared-button__matbutton ${rest.className}`;
  const classes = useStyles();
  const colorClass = color === 'danger' ? classes.containedDanger : ``;
  return (
    <div className="shared-button">
      <MuiButton
        {...rest}
        // eslint-disable-next-line react/forbid-component-props
        style={{ ...style, opacity: disabled ? 0.5 : 1 }}
        variant={variant}
        size={size}
        color={color !== 'danger' ? color : 'inherit'}
        onClick={onClick}
        disabled={disabled || loading}
        className={clsx(activeClass, colorClass)}
      >
        {icon && (
          <Box display="flex" mr="5px">
            {icon}
          </Box>
        )}
        {loading ? (
          <CircularProgress size={20} className="loading my-3" />
        ) : (
          text || children
        )}
      </MuiButton>
    </div>
  );
}

export default Button;
