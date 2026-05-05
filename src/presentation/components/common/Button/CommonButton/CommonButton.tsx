import MuiButton, { ButtonProps } from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import React, { PropsWithChildren } from 'react';

import { CommonButtonStyles } from './index.styles';

interface CommonButtonProps extends Omit<ButtonProps, 'color'> {
  color: 'default' | 'danger' | 'error' | 'success';
}

const Button = withStyles(CommonButtonStyles)(MuiButton);

export default function CommonButton({
  children,
  color,
  ...props
}: PropsWithChildren<CommonButtonProps>) {
  // danger and error have same color theme. So user can use depend on the context
  const buttonColors: Record<CommonButtonProps['color'], ButtonProps['color']> =
    {
      default: 'default',
      success: 'primary',
      error: 'secondary',
      danger: 'secondary',
    };
  return (
    <Button {...props} color={buttonColors[color]}>
      {children}
    </Button>
  );
}
