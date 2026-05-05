import { ChipProps } from '@material-ui/core';
import capitalize from 'lodash/capitalize';
import * as React from 'react';

import { ChipStyle, useStyles } from './index.styles';

export interface IChipProps extends Omit<ChipProps, 'color'> {
  text: string;
  fontSize?: number;
  color?: 'default' | 'primary' | 'white' | 'success' | 'danger';
  variant?: 'default' | 'outlined';
  size?: 'small' | 'medium';
  className?: string;
  isCanClick?: boolean;
  isDisabled?: boolean;
  handleDelete?: () => void;
  handleClick?: () => void;
}

function Chip({
  text,
  fontSize = 11,
  color = 'default',
  variant = 'default',
  size = 'small',
  className,
  isCanClick = false,
  isDisabled = false,
  handleDelete,
  handleClick,
  ...props
}: IChipProps) {
  const classes = useStyles({ fontSize });
  const colorProp = color === 'default' ? '' : capitalize(color);
  const colorClass = classes[`${variant}${colorProp}` as keyof typeof classes];
  const classesJoin = className ? `${colorClass} ${className}` : colorClass;
  return (
    <ChipStyle
      className={classesJoin}
      label={text}
      variant={variant}
      size={size}
      disabled={isDisabled}
      onDelete={handleDelete}
      clickable={isCanClick}
      onClick={handleClick}
      data-testid="custom-chip"
      {...props}
    />
  );
}

export default Chip;
