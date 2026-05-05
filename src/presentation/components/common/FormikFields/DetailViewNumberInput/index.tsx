import { Typography } from '@material-ui/core';
import React, { FocusEvent, useEffect, useState } from 'react';
import { NumericFormat, NumberFormatValues } from 'react-number-format';

import { TextField } from '../DetailViewTextField/DetailViewTextField';
import InputContainer from '../InputContainer';

interface Props {
  name: string;
  title: string;
  showAsterisk?: boolean;
  isReadOnly?: boolean;
  suffix?: string;
  thousandSeparator?: boolean;
  allowLeadingZeros?: boolean;
  allowNegative?: boolean;
  value: number;
  placeholder?: string;
  onValueChange?: (val: NumberFormatValues) => void;
  handleUpdate: (val: unknown) => void;
  onBlur?: (e: FocusEvent) => void;
  error?: string;
  isDisabled?: boolean;
  className?: string;
  dataTestId?: string;
}

function DetailViewNumberInput({
  name,
  title,
  value,
  suffix,
  onValueChange,
  onBlur,
  handleUpdate,
  error,
  className,
  dataTestId,
  showAsterisk = false,
  isReadOnly = false,
  isDisabled = false,
  thousandSeparator = false,
  allowLeadingZeros = false,
  allowNegative = false,
  placeholder = '',
}: Props) {
  const [_value, setValue] = useState<number | undefined>(value);

  useEffect(() => {
    setValue(value);
  }, [value]);

  const handleSubmit = (e: FocusEvent<any>) => {
    handleUpdate({ [name]: _value });
    onBlur?.(e);
  };

  const handleChange = (val: NumberFormatValues) => {
    setValue(val.floatValue);
    onValueChange?.(val);
  };

  return (
    <InputContainer
      title={title}
      error={error}
      dataTestId={`${dataTestId}-datefield`}
      isReadOnly={isReadOnly}
      showAsterisk={showAsterisk}
      isDisabled={isDisabled}
    >
      {isReadOnly ? (
        <Typography data-testid={`${dataTestId}-number-readonly`}>
          {value}
        </Typography>
      ) : (
        <NumericFormat
          suffix={suffix}
          thousandSeparator={thousandSeparator}
          allowLeadingZeros={allowLeadingZeros}
          allowNegative={allowNegative}
          customInput={TextField}
          name={name}
          value={_value}
          placeholder={placeholder}
          onValueChange={handleChange}
          onBlur={handleSubmit}
          disabled={isDisabled}
          className={className}
          autoComplete="off"
          data-testid={dataTestId}
          inputProps={{
            className: `textfield-input ${
              isDisabled ? 'purchases' : undefined
            }`,
          }}
        />
      )}
    </InputContainer>
  );
}

export default DetailViewNumberInput;
