import { InputLabel } from '@material-ui/core';
import DateRangeIcon from '@material-ui/icons/DateRange';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './KeyBoardDatePicker.scss';

interface IKeyBoardDatePicker {
  name: string;
  value: string;
  className: string;
  onChange: (date: MaterialUiPickersDate, value?: string | null) => void;
  invalidDateMessage: boolean;
  minDateMessage: boolean;
  autoOk: boolean; // Auto close after select Date
  disableToolbar: boolean;
  fixedLabel: boolean;
  InputLabelProps?: any;
  label?: string;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  disablePast?: boolean;
  required?: boolean;
}

function KeyBoardDatePicker({
  name,
  value,
  onChange,
  invalidDateMessage,
  minDateMessage,
  autoOk,
  disableToolbar,
  fixedLabel = false,
  InputLabelProps,
  helperText,
  label,
  required = true,
  ...rest
}: IKeyBoardDatePicker) {
  const [inputLabelProps, setInputLabelProps] = useState(InputLabelProps);
  const [isBlur, setIsBlur] = useState(false);
  const dateRef = useRef(null);
  useEffect(() => {
    if (fixedLabel) {
      setInputLabelProps({ ...InputLabelProps, shrink: true });
    } else if (typeof InputLabelProps === 'object' && InputLabelProps.shrink) {
      const temp = InputLabelProps;
      delete temp.shrink;
      setInputLabelProps(temp);
    }
  }, [InputLabelProps, fixedLabel]);

  const handleBlur = () => {
    setIsBlur(true);
  };

  const errorElement = (error: string) => (
    <span className="error-text">{error}</span>
  );

  const isDateError = useMemo(
    () => (required && !value && isBlur) || Boolean(helperText),
    [required, value, isBlur, helperText]
  );

  return (
    <>
      {label && <InputLabel {...inputLabelProps}>{label}</InputLabel>}
      <KeyboardDatePicker
        name={name}
        ref={dateRef}
        value={value}
        variant="inline"
        inputVariant="outlined"
        format="dd/MM/yyyy"
        onChange={onChange}
        invalidDateMessage={invalidDateMessage}
        minDateMessage={minDateMessage}
        autoOk={autoOk}
        disableToolbar={disableToolbar}
        keyboardIcon={<DateRangeIcon />}
        InputLabelProps={inputLabelProps}
        onBlur={handleBlur}
        error={isDateError}
        helperText={isDateError ? errorElement(helperText || '') : null}
        autoComplete="off"
        {...rest}
      />
    </>
  );
}

export default KeyBoardDatePicker;
