import React from 'react';
import { NumericFormat, NumberFormatValues } from 'react-number-format';

import Controls from '../Control';

interface INumberFormat {
  suffix?: string;
  thousandSeparator?: boolean | string;
  allowLeadingZeros?: boolean;
  onValueChange: (values: NumberFormatValues) => void;
  allowNegative?: boolean;
  value?: number;
  name?: string;
  placeholder?: string;
  onBlur?: any;
  error?: any;
  disabled?: boolean;
  label?: string;
  fixedLabel?: boolean;
  className?: string;
  adornment?: string;
  dataTestId?: string;
  containerClass?: string;
}

export interface INumberFormatInputValue {
  floatValue: number;
  formattedValue: string;
  value: string;
}

function NumberInput({
  suffix = '',
  thousandSeparator = true,
  allowLeadingZeros = true,
  allowNegative = false,
  onValueChange,
  name,
  value,
  placeholder,
  onBlur,
  error,
  disabled = false,
  label,
  fixedLabel,
  className,
  adornment,
  dataTestId,
  containerClass,
}: INumberFormat) {
  return (
    <div className={containerClass}>
      <NumericFormat
        suffix={suffix}
        thousandSeparator={thousandSeparator}
        allowLeadingZeros={allowLeadingZeros}
        allowNegative={allowNegative}
        customInput={Controls.Input}
        name={name}
        value={value}
        placeholder={placeholder}
        onValueChange={onValueChange}
        onBlur={onBlur}
        // Input Props
        adornment={adornment}
        error={error}
        disabled={disabled}
        fixedLabel={fixedLabel}
        label={label}
        className={className}
        autoComplete="off"
        data-testid={dataTestId}
        generic
      />
    </div>
  );
}

export default NumberInput;
