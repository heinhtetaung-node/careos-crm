import {
  FormControl,
  FormControlLabel,
  Checkbox as MuiCheckbox,
} from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

export default function Checkbox(props: any) {
  const { label, value, className, ...rest } = props;

  const checkBox = (
    <MuiCheckbox
      checked={value}
      {...rest}
      inputProps={{
        'data-testid': `checkbox-${label}`,
      }}
    />
  );

  return (
    <FormControl className={clsx('shared-check-box', className)}>
      <FormControlLabel control={checkBox} label={label} />
    </FormControl>
  );
}
