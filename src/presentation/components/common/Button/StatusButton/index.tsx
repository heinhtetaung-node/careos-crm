import { HighPriorityIcon } from '@alphafounders/icons';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import capitalize from 'lodash/capitalize';
import * as React from 'react';

import { Button, useStyles } from './index.styles';

interface Props {
  statusType: string;
  text: string;
  variant: 'contained' | 'outlined' | 'text';
  color: 'primary' | 'error' | 'success';
  isDisabled?: boolean;
  handleClick: () => void;
  size?: 'small' | 'medium' | 'large';
}

const getStatusIcon = (statusType: string) => {
  switch (statusType) {
    case 'positive':
      return <CheckRoundedIcon />;
    case 'negative':
      return <CloseRoundedIcon />;
    default:
      return <HighPriorityIcon />;
  }
};

function StatusButton({
  statusType,
  text,
  variant,
  color,
  isDisabled = false,
  handleClick,
  size,
}: Readonly<Props>) {
  const classes = useStyles();

  const classnames =
    classes[`${variant}${capitalize(color)}` as keyof typeof classes];

  return (
    <Button
      className={classnames}
      startIcon={getStatusIcon(statusType)}
      disabled={isDisabled}
      variant={variant}
      onClick={handleClick}
      data-testid="status-button"
      size={size}
    >
      {text}
    </Button>
  );
}

export default StatusButton;
