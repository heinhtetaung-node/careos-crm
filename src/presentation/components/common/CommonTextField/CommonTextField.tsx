import {
  withStyles,
  createStyles,
  Theme,
  alpha,
} from '@material-ui/core/styles';
import MuiTextField, { TextFieldProps } from '@material-ui/core/TextField';
import React from 'react';

export const textFieldStyles = (theme: Theme) =>
  createStyles({
    root: {
      '& .MuiAutocomplete-popupIndicator': {
        '&.Mui-disabled svg': {
          color: theme.palette.grey[200],
        },
        '& svg': {
          fontSize: '1.25rem',
          color: theme.palette.primary.main,
        },
      },
      '& .MuiAutocomplete-clearIndicator.MuiAutocomplete-clearIndicatorDirty': {
        '& svg': {
          color: theme.palette.grey[400],
        },
      },
      '& .MuiOutlinedInput-root fieldset': {
        borderColor: theme.palette.grey[200],
      },
      '& .MuiOutlinedInput-root': {
        '&:hover fieldset': {
          borderColor: theme.palette.common.blueHover,
        },
      },
      '& .MuiOutlinedInput-root.Mui-error': {
        '&:hover fieldset': {
          borderColor: theme.palette.danger.main,
        },
      },
      '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline':
        {
          borderColor: theme.palette.grey[200],
        },
      '& .MuiFilledInput-root': {
        padding: '10px',
        paddingRight: '10px !important',
        paddingBottom: '10px !important',
        background: 'transparent',
        '& .Mui-focused': {
          background: `linear-gradient(0deg, ${alpha(
            theme.palette.grey[100],
            0.25
          )}, ${alpha(theme.palette.grey[100], 0.25)}), ${
            theme.palette.common.white
          }`,
        },
        '&:hover': {
          background: `linear-gradient(0deg, ${alpha(
            theme.palette.grey[100],
            0.25
          )}, ${alpha(theme.palette.grey[100], 0.25)}), ${
            theme.palette.common.white
          }`,
        },
        '& .MuiInputBase-input': {
          padding: '10 !important',
          lineHeight: '20px',
          height: 'unset',
        },
        '& .MuiAutocomplete-input': {
          paddingLeft: '10px !important',
          paddingRight: '10px !important',
        },
      },
      '& .MuiFilledInput-underline:before': {
        border: '1px solid transparent',
      },
      '& .MuiInputLabel-formControl:not(.Mui-disabled)': {
        '& .MuiFormLabel-asterisk': {
          color: theme.palette.danger.main,
        },
      },
    },
  });

const TextField = withStyles(textFieldStyles)(MuiTextField);

export interface CommonTextFieldProps
  extends Omit<TextFieldProps, 'variant' | 'InputLabelProps' | 'size'> {
  label: string;
  dataTestId?: string;
  handleDataUpdate?: (val?: any) => void;
  variant?: 'outlined' | 'filled';
}

export default function CommonTextField({
  handleDataUpdate = () => null,
  dataTestId = 'common-textfield',
  variant = 'outlined',
  ...props
}: CommonTextFieldProps) {
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key === 'Enter') handleDataUpdate(props.value);
  };
  return (
    <TextField
      {...props}
      variant={variant}
      onKeyDown={handleKeyDown}
      onBlur={() => {
        handleDataUpdate(props.value);
      }}
      inputProps={{
        ...props.inputProps,
        'data-testid': dataTestId,
      }}
      InputLabelProps={{
        shrink: true,
        focused: props.focused,
        disabled: props.disabled,
        error: props.error,
      }}
      size="small"
    />
  );
}
