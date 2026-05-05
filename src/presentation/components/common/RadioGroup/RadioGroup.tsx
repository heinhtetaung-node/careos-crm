import FormControl from '@material-ui/core/FormControl';
import MuiFormControlLabel from '@material-ui/core/FormControlLabel';
import MuiRadio, { RadioProps } from '@material-ui/core/Radio';
import MuiRadioGroup, { RadioGroupProps } from '@material-ui/core/RadioGroup';
import {
  alpha,
  withStyles,
  createStyles,
  Theme,
} from '@material-ui/core/styles';
import React, { useEffect, useState } from 'react';

export interface Option
  extends Omit<RadioProps, 'checkedIcon' | 'icon' | 'size' | 'color'> {
  label: string;
  status?: 'normal' | 'danger';
}

interface RadioFieldGroupProps extends RadioGroupProps {
  options: Option[];
}

const FormControlStyles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      color: theme.palette.grey[800],
    },
    label: {
      '&.Mui-disabled': {
        color: theme.palette.grey[400],
      },
    },
  });

const radioPrimaryHoverColor = (theme: Theme) =>
  (theme.palette.common as { blueSkyLight?: string }).blueSkyLight ??
  theme.palette.primary?.main ??
  '#2196f3';

const radioDangerMain = (theme: Theme) =>
  (theme.palette as { danger?: { main: string } }).danger?.main ??
  theme.palette.error.main;

const RadioStyles = (theme: Theme) =>
  createStyles({
    root: {
      color: theme.palette.grey[200],
      padding: '10px',
    },
    colorPrimary: {
      '&:hover, &.Mui-checked:hover': {
        backgroundColor: `${alpha(radioPrimaryHoverColor(theme), 0.04)}`,
      },
      '&.Mui-disabled': {
        color: theme.palette.grey[200],
      },
    },
    colorSecondary: {
      '&.Mui-checked': {
        color: radioDangerMain(theme),
      },
      '&:hover, &.Mui-checked:hover': {
        backgroundColor: `${alpha(radioDangerMain(theme), 0.04)}`,
      },
    },
  });

const RadioGroupStyles = () =>
  createStyles({
    root: {
      justifyContent: 'center',
      gap: '10px',
    },
  });

const FormControlLabel = withStyles(FormControlStyles)(MuiFormControlLabel);
const Radio = withStyles(RadioStyles)(MuiRadio);
const RadioGroup = withStyles(RadioGroupStyles)(MuiRadioGroup);

function WithRenderControl(Component: React.ComponentType<RadioProps>) {
  return function EnhancedRadio({
    status = 'normal',
    ...rest
  }: Pick<Option, 'disabled' | 'status'>) {
    return (
      <Component
        size="small"
        color={status === 'danger' ? 'secondary' : 'primary'}
        {...rest}
      />
    );
  };
}

const CustomizedRadio = WithRenderControl(Radio);

export default function RadioFieldGroup(
  props: RadioFieldGroupProps & { isDisabled?: boolean }
) {
  const { options, isDisabled, value, onChange, ...rest } = props;

  const [_value, setValue] = useState(value);

  useEffect(() => {
    setValue(value);
  }, [value]);

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    changedValue: string
  ) => {
    onChange?.(e, changedValue);
    setValue(changedValue);
  };

  return (
    <FormControl>
      <RadioGroup {...rest} value={_value} onChange={handleOnChange}>
        {options &&
          options.length > 0 &&
          options.map(({ value: optValue, label, ...radioProps }) => (
            <FormControlLabel
              value={optValue}
              key={label}
              control={<CustomizedRadio {...radioProps} />}
              label={label}
              disabled={isDisabled}
            />
          ))}
      </RadioGroup>
    </FormControl>
  );
}
