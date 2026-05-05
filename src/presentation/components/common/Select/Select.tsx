import Box from '@material-ui/core/Box';
import {
  withStyles,
  makeStyles,
  createStyles,
  useTheme,
  alpha,
} from '@material-ui/core/styles';
import MuiTextField from '@material-ui/core/TextField';
import ExpandMore from '@material-ui/icons/ExpandMore';
import React, { ChangeEventHandler, useEffect, useState } from 'react';

import { textFieldStyles } from '../CommonTextField/CommonTextField';
import {
  MenuOptionProps,
  CustomMenuItem,
  renderMenuItem,
  CustomMenuItemProps,
  useStyles,
} from '../Menu/MenuItem';

interface SelectOption extends MenuOptionProps {
  value: any;
}

interface SelectProps {
  type: CustomMenuItemProps['type'];
  label?: string;
  error?: boolean;
  disabled?: boolean;
  currentIndex?: number;
  handleDataSelect?: (payload: any) => void;
  options: SelectOption[];
  dataTestId?: string;
}

const useMenuStyles = makeStyles((theme) =>
  createStyles({
    paper: {
      border: `1px solid ${theme.palette.primary.main}`,
      boxShadow: `0px 7px 15px ${alpha('#2a31cb', 0.1)}`,
    },
  })
);

const useSelectStyles = makeStyles(
  createStyles({
    select: {
      '.MuiInputBase-root &.MuiSelect-select, .MuiInputBase-root &.MuiSelect-select:hover, .MuiInputBase-root .MuiSelect-select[aria-expanded=true]':
        {
          border: 0,
          boxShadow: 'none',
        },
    },
  })
);

const TextField = withStyles(textFieldStyles)(MuiTextField);

export default function Select({
  type,
  options,
  label,
  error = false,
  disabled = false,
  currentIndex,
  handleDataSelect,
  dataTestId,
}: SelectProps) {
  const theme = useTheme();
  const classes = useStyles();
  const selectClasses = useSelectStyles();
  const menuClasses = useMenuStyles();
  const [selectedValue, setSelectedValue] = useState(options[0].value);

  const handleMenuItemClick: ChangeEventHandler<HTMLInputElement> = (e) => {
    const {
      target: { value },
    } = e;
    setSelectedValue(value);
    if (handleDataSelect != null) handleDataSelect(value);
  };

  useEffect(() => {
    if (currentIndex != null) {
      if (currentIndex < options.length) {
        setSelectedValue(options[currentIndex].value);
      } else {
        setSelectedValue(options[0].value);
      }
    }
  }, [currentIndex, options]);

  return (
    <TextField
      data-testid={dataTestId}
      fullWidth
      select
      error={error}
      disabled={disabled}
      label={label}
      variant="outlined"
      value={selectedValue}
      SelectProps={{
        classes: selectClasses,
        IconComponent: ExpandMore,
        MenuProps: { classes: menuClasses },
        renderValue: (value) => (
          <Box
            color={disabled ? theme.palette.grey[200] : theme.palette.grey[800]}
            component="span"
          >
            {options?.find((opt) => opt.value === value)?.text as any}
          </Box>
        ),
      }}
      onChange={handleMenuItemClick}
    >
      {options.map((option) => {
        const selected = option.value === selectedValue;
        return (
          <CustomMenuItem
            data-testid={`${dataTestId}-${option.value}`}
            key={option.text}
            disabled={option.isDisabled}
            value={option.value}
            selected={selected}
          >
            {renderMenuItem(option, type, classes, selected)}
          </CustomMenuItem>
        );
      })}
    </TextField>
  );
}
