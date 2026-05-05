import { CalendarIcon } from '@alphafounders/icons';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import clsx from 'clsx';
import _isEmpty from 'lodash/isEmpty';
import React, { useEffect } from 'react';

import { getString } from 'presentation/theme/localization';
import { DOB } from 'shared/types/controls';
import { isValid } from 'utils/datetime';

import { formatDate, getDateFormatWithThaiYear } from './index.helper';
import useStyles from './index.style';

interface Props {
  value: DOB;
  onChangeDate: (value: any) => void;
  name?: string;
  placeholder?: string;
  showThaiYear?: boolean;
  isDisabled?: boolean;
  isFieldDisabled?: boolean;
  textFieldError?: boolean;
  error?: string;
  isPossibleInput?: boolean;
  className?: string;
  shouldDisableDate?: (date: MaterialUiPickersDate) => boolean;
  validateFn?: (date: string) => string;
  dataTestId?: string;
}

function DatePickerWithThaiYear({
  name = 'datepicker',
  value,
  onChangeDate,
  placeholder,
  error,
  textFieldError = true,
  showThaiYear = false,
  isPossibleInput = true,
  isFieldDisabled = false,
  isDisabled = false,
  shouldDisableDate = undefined,
  className = '',
  validateFn = () => '',
  dataTestId = 'date-picker-with-thai-year',
}: Readonly<Props>) {
  const classes = useStyles();
  const [selectedDate, setSelectedDate] = React.useState<DOB>(value);
  const [_errorMsg, setErrorMsg] = React.useState<string | null>();

  useEffect(() => {
    setSelectedDate(value === '' ? null : value);
    if (textFieldError) setErrorMsg(error);
  }, [value, error, textFieldError]);

  const handleChangeDate = (val: any) => {
    setSelectedDate(val);
    const validationError = validateFn(val);
    if (isValid(new Date(val)) && _isEmpty(validationError)) {
      setErrorMsg(null);
      onChangeDate(val);
    } else {
      setErrorMsg(
        _isEmpty(validationError)
          ? getString('package.invalidDateFormat')
          : validationError
      );
    }
  };

  const resetIfNotValid = () => {
    if (selectedDate && !isValid(new Date(selectedDate))) {
      setSelectedDate(value === '' ? null : value);
      setErrorMsg(error);
    }
  };

  if (isFieldDisabled) {
    return (
      <span
        className={`${classes.disabled} ${classes.fieldItem}`}
        data-testid="disabled-datefield"
      >
        {selectedDate ? formatDate(selectedDate, showThaiYear) : ''}
      </span>
    );
  }
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
        className={`${classes.fieldItem} ${className}`}
        name={name}
        disabled={isDisabled}
        placeholder={placeholder}
        shouldDisableDate={
          shouldDisableDate ? (date) => shouldDisableDate(date) : undefined
        }
        keyboardIcon={
          <CalendarIcon
            className={clsx({
              [classes.calendarIcon]: true,
              'Mui-disabled': isDisabled,
            })}
            fontSize="small"
          />
        }
        format={
          selectedDate && isValid(new Date(selectedDate)) && showThaiYear
            ? getDateFormatWithThaiYear(selectedDate)
            : 'dd/MM/yyyy'
        }
        mask="__/__/____"
        value={selectedDate}
        onChange={handleChangeDate}
        KeyboardButtonProps={
          {
            'aria-label': 'datepicker with thai year',
            'data-testid': `${name}-edit-button`,
          } as any
        }
        onBlur={resetIfNotValid}
        helperText={_errorMsg}
        error={!!error || Boolean(_errorMsg)}
        InputProps={
          {
            readOnly: !isPossibleInput,
            'data-testid': dataTestId,
          } as any
        }
      />
    </MuiPickersUtilsProvider>
  );
}

export default DatePickerWithThaiYear;
