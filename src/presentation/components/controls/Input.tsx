import { InputAdornment, makeStyles, TextField } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import './Input.scss';

const useStyles = makeStyles((theme) => ({
  root: {
    '& input': {
      border: '1px solid',
      borderColor: theme.palette.grey[200],
      borderRadius: 10,
      padding: '.7rem',
      '&:hover': {
        borderColor: theme.palette.primary.main,
      },
      '&:disabled': {
        cursor: 'default',
        pointerEvents: 'none',
      },
    },
  },
}));

export default function Input({
  fixedLabel = false,
  placeholder,
  InputLabelProps,
  error,
  style,
  disabled = false,
  className = '',
  name,
  dataTestid,
  adornment,
  generic = false,
  backgroundColor = '',
  ...rest
}: any) {
  const classes = useStyles();
  const getLabelProps = () => {
    let labelProps;
    if (fixedLabel) {
      labelProps = { ...InputLabelProps, shrink: true };
    } else if (typeof InputLabelProps === 'object' && InputLabelProps.shrink) {
      labelProps = InputLabelProps;
      delete labelProps.shrink;
    }
    return labelProps;
  };

  return (
    <TextField
      className={clsx({
        'shared-input': true,
        'shared-input--error': !adornment && error,
        [className]: true,
        [classes.root]: !generic,
      })}
      placeholder={placeholder}
      disabled={disabled}
      InputProps={{
        endAdornment: adornment && (
          <InputAdornment position="end">{adornment}</InputAdornment>
        ),
        disableUnderline: true,
        'data-testid': dataTestid ?? `input-${name}`,
        style: backgroundColor ? { backgroundColor } : undefined,
      }}
      name={name}
      InputLabelProps={getLabelProps()}
      style={style}
      {...(error && { error: true, helperText: error })}
      {...rest}
    />
  );
}
