import {
  Button,
  ClickAwayListener,
  Grid,
  InputAdornment,
  Popper,
  makeStyles,
  alpha,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DateRangeSharpIcon from '@material-ui/icons/DateRangeSharp';
import en from 'date-fns/locale/en-GB';
import th from 'date-fns/locale/th';
import * as React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

import { getLanguage, getString } from 'presentation/theme/localization';
import { format } from 'utils/datetime';

import DateInputMask from './DateInputMask';
import { dateValueFormat, minDateCondition, maxDateCondition } from './helper';
import YearPicker from './YearPicker';

import IconButton from '../Button/IconButton';
import CommonTextField from '../CommonTextField/CommonTextField';

export interface IDatepicker {
  dateFormat?: string;
  maskedFormat?: Array<string>;
  maskedDelimiter?: string;
  onChange: (date: Date | undefined) => void;
  onEveryChange?: (date: Date | undefined) => void;
  dateValue?: Date | string;
  textFieldProps?: Record<string, any>;
  customInputProps?: Record<any, any>;
  minDate?: Date;
  maxDate?: Date;
  isDob?: boolean;
  disabled?: boolean;
  setIsDateInputEmpty?: (isBool: boolean) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    fontFamily: `${theme.typography.fontFamily} !important`,
    width: '308px',
    height: '334px',
    backgroundColor: 'white',
    border: `1px solid ${theme.palette.primary.main} !important`,
    borderRadius: '10px !important',
    color: `${theme.palette.grey[800]} !important`,
    zIndex: 1400,
    marginTop: '2px',
    '& .react-datepicker': {
      fontFamily: `${theme.typography.fontFamily}`,
      backgroundColor: 'transparent',
      border: 0,
    },
    '& .react-datepicker__month': {
      margin: 0,
      padding: '0 10px 7px',
      '& .react-datepicker__month-wrapper': {
        marginTop: '30px',
        '&:first-child': {
          marginTop: '0',
        },
      },
      '& .react-datepicker__month--disabled': {
        color: theme.palette.grey[200],
      },
      '& .react-datepicker__day': {
        padding: '4.41px',
        color: theme.palette.grey[800],
        borderRadius: '20px',
        backgroundColor: 'white',
        '&:hover': {
          backgroundColor: alpha(theme.palette.grey[200], 0.33),
        },
        '&[aria-selected="true"], &:not([aria-selected="false"]) &.react-datepicker__day--keyboard-selected':
          {
            color: 'white',
            backgroundColor: theme.palette.primary.main,
            border: '0 !important',
          },
        '&[aria-disabled="true"]': {
          color: theme.palette.grey[200],
          backgroundColor: 'white',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
        '&.react-datepicker__day--today': {
          border: `0.5px solid ${theme.palette.grey[800]}`,
          fontWeight: 'normal',
        },
        '&.react-datepicker__day--outside-month': {
          visibility: 'hidden',
        },
      },
    },
    '& .react-datepicker__month-container': {
      fontSize: '14px',
      width: '308px',
    },
    '& .react-datepicker__month-text': {
      width: '90px !important',
      padding: '10.5px 0',
      borderRadius: '20px !important',
      margin: '3px !important',
      '&:hover': {
        color: theme.palette.grey[800],
        backgroundColor: alpha(theme.palette.grey[200], 0.33),
      },
      '&[aria-selected="true"]': {
        color: 'white',
        backgroundColor: `${theme.palette.primary.main} !important`,
      },
      '&[aria-current="date"]': {
        fontWeight: 'normal',
      },
    },
    '& .react-datepicker__header': {
      textAlign: 'left',
      backgroundColor: 'transparent',
      border: 0,
      padding: '15px 16px 7px',
      fontSize: '14px',
      fontWeight: 700,
      color: theme.palette.grey[800],
      '& .monthYearDob': {
        display: 'flex',
        alignItems: 'center',
        '& .MuiIconButton-root': {
          marginLeft: '4px',
        },
      },
      '& .customDatePickerHeader': {
        display: 'flex',
        justifyContent: 'space-between',
        '& .monthYear': {
          display: 'flex',
          alignItems: 'center',
          width: '191px',
          justifyContent: 'space-between',
          '& .MuiIconButton-root': {
            width: '20px',
            height: '20px',
          },
        },
        '& .MuiButton-root': {
          borderRadius: '10px',
          padding: '2px 8px',
          backgroundColor: theme.palette.grey[200],
          height: '20px',
          boxShadow: 'none',
          '& .MuiButton-label': {
            fontSize: '11px',
            fontWeight: 700,
            color: theme.palette.primary.main,
            '&:hover, &:focus': {
              color: '#003d74',
            },
          },
        },
        '& .monthYearUpDown': {
          width: '67px',
          display: 'flex',
          justifyContent: 'space-between',
        },
      },
      '& .react-datepicker__day-names': {
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '16px',
      },
      '& .react-datepicker__day-name': {
        fontSize: '11px',
        color: theme.palette.grey[400],
        fontWeight: 'normal',
        padding: '0 7.5px',
        lineHeight: '16px',
      },
    },
    '& .customYearPicker': {
      fontFamily: theme.typography.fontFamily,
      backgroundColor: 'white',
      borderRadius: '10px',
      '& .header': {
        padding: '16px',
        fontSize: '14px',
        fontWeight: 700,
        color: theme.palette.grey[800],
      },
      '& .yearPickerList': {
        overflow: 'auto',
        height: '261px',
        paddingBottom: '10px',
        '& .thisYear': {
          border: `1px solid ${theme.palette.grey[800]}`,
        },
      },
      '& button': {
        fontFamily: 'inherit',
        fontSize: '14px',
        padding: '8px 10.5px',
        margin: '3px',
        cursor: 'pointer',
        border: 0,
        color: theme.palette.grey[800],
        backgroundColor: 'transparent',
        borderRadius: '20px',
        width: '52px',
        boxSizing: 'border-box',
        '&:hover': {
          backgroundColor: alpha(theme.palette.grey[200], 0.33),
        },
        '&:focus, &.selected': {
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          border: '0 !important',
        },
      },
    },
    '& .MuiIconButton-root': {
      width: '20px',
      height: '20px',
      '&:hover': {
        color: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.grey[200], 0.33),
      },
    },
  },
}));

function Datepicker({
  dateFormat = 'dd/MM/yyyy',
  maskedFormat = ['d', 'm', 'Y'],
  maskedDelimiter = '/',
  dateValue = undefined,
  onChange,
  onEveryChange,
  textFieldProps = {},
  customInputProps = {},
  minDate,
  maxDate,
  isDob = false,
  disabled = false,
  setIsDateInputEmpty,
}: Readonly<IDatepicker>) {
  const [open, setOpen] = React.useState(false);
  const [year, setYear] = React.useState<Date | undefined>(undefined);
  const [month, setMonth] = React.useState<Date | undefined>(undefined);
  const [anchorEl, setAnchorEl] = React.useState<any>(null);
  const [maskInput, setMaskInput] = React.useState<any>(null);
  const [isEmpty, setIsEmpty] = React.useState(false);
  const dateInputRef = React.useRef<any>();
  const minDateValue = minDateCondition({ date: minDate, isDob });
  const maxDateValue = maxDateCondition({ date: maxDate, isDob });
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    dateValueFormat({ dateValue, dateFormat, maxDate: maxDateValue })
  );
  const isMaxDateHigh = maxDateValue < new Date();
  const openTodate = isMaxDateHigh && !selectedDate ? maxDateValue : undefined;

  const getCurrentLocale = getLanguage();
  const isThai = getCurrentLocale === 'th';
  let currentDateLocale = en;
  if (isThai) {
    registerLocale('th', th);
    currentDateLocale = th;
  } else {
    registerLocale('en', en);
  }

  const formatWeekDay = React.useMemo(() => {
    if (isThai) return undefined;

    return (weekDay: any) => weekDay.slice(0, 3);
  }, [isThai]);

  const selectedMonthText = (date: Date) =>
    date ? format(date, 'LLLL', { locale: currentDateLocale }) : 'null';

  const handleCalendarOpen = () => {
    if (!dateInputRef.current) return;
    setOpen((prev) => !prev);
    setAnchorEl(dateInputRef.current);
  };

  const handleCalendarClose = () => {
    setOpen(false);
  };

  const onDateChange = (date: Date) => {
    if (onEveryChange) onEveryChange(date);
  };

  const handleYearChange = (date: Date) => {
    setYear(date);
    const updateLatestMonthDate = () => {
      date.setDate(maxDateValue.getDate());
      date.setMonth(maxDateValue.getMonth());
    };

    if (!selectedDate) {
      updateLatestMonthDate();
      setSelectedDate(date);
      onDateChange(date);
      return;
    }

    if (date.getFullYear() < maxDateValue.getFullYear()) {
      setSelectedDate(date);
      onDateChange(date);
      return;
    }

    /* Prevent disabled month select. 
       If selected month > current month, auto select to current day/month. 
    */
    if (date.getMonth() > maxDateValue.getMonth()) {
      updateLatestMonthDate();
    }
    setSelectedDate(date);
    onDateChange(date);
  };

  const handleMonthChange = (date: Date) => {
    setMonth(date);
    if (selectedDate) {
      date.setDate(selectedDate.getDate());
    }
    setSelectedDate(date);
    onDateChange(date);
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    onDateChange(date);
    onChange(date);
    setOpen(false);
    if (setIsDateInputEmpty) setIsDateInputEmpty(false);
  };

  const handleDataUpdate = () => {
    if (!dateInputRef) return;
    if (!dateInputRef.current?.value) return;
    let dateInputValue = dateValueFormat({
      dateValue: dateInputRef.current.value,
      dateFormat,
      maxDate: maxDateValue,
    });

    if (!dateInputValue) return;
    if (isDob) {
      dateInputValue =
        !isMaxDateHigh && dateInputValue > new Date()
          ? new Date()
          : dateInputValue;
    }

    handleDateChange(dateInputValue);
  };

  const handlerTodayButtonClick = () => {
    if (isMaxDateHigh) {
      handleDateChange(maxDateValue);
      return;
    }
    handleDateChange(new Date());
  };

  React.useEffect(() => {
    if (isEmpty) {
      setSelectedDate(undefined);
    } else
      setSelectedDate(
        dateValueFormat({ dateValue, dateFormat, maxDate: maxDateValue })
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateValue, isEmpty]);

  const clearMonthYear = () => {
    setYear(undefined);
    setMonth(undefined);
  };

  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      clearMonthYear();
    }
    prevOpen.current = open;
  }, [open]);

  React.useEffect(() => {
    if (selectedDate && maskInput && !disabled) {
      maskInput?.setRawValue(format(new Date(selectedDate), dateFormat));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFormat, maskInput, selectedDate]);

  const monthPickerHeaderDob = ({ date }: any): JSX.Element => (
    <div className="monthYearDob">
      {selectedMonthText(date)}
      &nbsp;
      {date.getFullYear()}
      <IconButton icon={<ArrowDropDownIcon />} handleClick={clearMonthYear} />
    </div>
  );

  const datePickerHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: any) => (
    <div className="customDatePickerHeader">
      {isDob && (
        <>
          {monthPickerHeaderDob({ date })}
          <div className="monthYearUpDown">
            <IconButton
              icon={<ChevronLeftIcon />}
              handleClick={decreaseMonth}
              isDisabled={prevMonthButtonDisabled}
            />
            <IconButton
              icon={<ChevronRightIcon />}
              handleClick={increaseMonth}
              isDisabled={nextMonthButtonDisabled}
            />
          </div>
        </>
      )}
      {!isDob && (
        <>
          <div className="monthYear">
            <IconButton
              icon={<ChevronLeftIcon />}
              handleClick={decreaseMonth}
              isDisabled={prevMonthButtonDisabled}
            />
            {selectedMonthText(date)}
            &nbsp;
            {date.getFullYear()}
            <IconButton
              icon={<ChevronRightIcon />}
              handleClick={increaseMonth}
              isDisabled={nextMonthButtonDisabled}
            />
          </div>
          <Button
            variant="contained"
            size="small"
            onClick={handlerTodayButtonClick}
          >
            {getString('datePicker.today')}
          </Button>
        </>
      )}
    </div>
  );

  function isValidDateFormat(input: string) {
    // regular expression pattern for DD/MM/YYYY
    const datePattern = /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    setIsEmpty(true);
    return datePattern.test(input);
  }

  const classes = useStyles();

  return (
    <ClickAwayListener onClickAway={handleCalendarClose}>
      <Grid>
        <CommonTextField
          inputRef={dateInputRef}
          label={textFieldProps.label ?? ''}
          placeholder={dateFormat}
          data-testid={!isDob ? 'date-picker' : 'dob-picker'}
          disabled={disabled}
          InputProps={{
            inputComponent: DateInputMask,
            inputProps: {
              ...customInputProps,
              onInit: setMaskInput,
              value: disabled ? '' : selectedDate,
              'data-testid': textFieldProps.dataTestId ?? '',
              options: {
                date: true,
                delimiter: maskedDelimiter,
                datePattern: maskedFormat,
                dateMin: format(new Date(minDateValue), 'yyyy-MM-dd'),
                dateMax: format(new Date(maxDateValue), 'yyyy-MM-dd'),
              },
            },
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  handleClick={handleCalendarOpen}
                  icon={<DateRangeSharpIcon />}
                  isDisabled={disabled}
                />
              </InputAdornment>
            ),
          }}
          handleDataUpdate={handleDataUpdate}
          onChange={(e) => {
            if (e.currentTarget && !e.currentTarget.value) {
              // eslint-disable-next-line no-unused-expressions
              if (setIsDateInputEmpty) setIsDateInputEmpty(true);
              setIsEmpty(true);
              // eslint-disable-next-line no-param-reassign
              e.currentTarget.value = '';
            } else if (
              e.currentTarget &&
              e.currentTarget.value &&
              setIsDateInputEmpty
            ) {
              if (isValidDateFormat(e.currentTarget.value))
                setIsDateInputEmpty(false);
              else setIsDateInputEmpty(true);
            }
          }}
          {...textFieldProps}
        />
        <Popper
          open={open}
          anchorEl={anchorEl}
          className={classes.root}
          placement="bottom-start"
        >
          {isDob && !year && !month && (
            <YearPicker
              minYear={minDateValue.getFullYear()}
              maxYear={maxDateValue.getFullYear()}
              selectedDate={selectedDate}
              handlerClick={handleYearChange}
              locale={currentDateLocale}
            />
          )}

          {isDob && year && !month && (
            <DatePicker
              selected={selectedDate}
              onChange={handleMonthChange}
              onChangeRaw={() => setMonth(selectedDate)}
              minDate={minDateValue}
              maxDate={maxDateValue}
              dateFormat={dateFormat}
              showMonthYearPicker
              showFullMonthYearPicker={isThai}
              renderCustomHeader={monthPickerHeaderDob}
              inline
              locale={getCurrentLocale}
            />
          )}

          {isDob && year && month && (
            <DatePicker
              renderCustomHeader={datePickerHeader}
              minDate={minDateValue}
              maxDate={maxDateValue}
              selected={selectedDate}
              onChange={handleDateChange}
              // To prevent nothing happen when click into a already selected date
              onChangeRaw={() => setOpen(false)}
              inline
              calendarStartDay={1}
              locale={getCurrentLocale}
              formatWeekDay={formatWeekDay}
            />
          )}

          {!isDob && (
            <DatePicker
              renderCustomHeader={datePickerHeader}
              minDate={minDateValue}
              maxDate={maxDateValue}
              selected={selectedDate}
              onChange={handleDateChange}
              onChangeRaw={() => setOpen(false)}
              inline
              calendarStartDay={1}
              locale={getCurrentLocale}
              openToDate={openTodate}
              formatWeekDay={formatWeekDay}
            />
          )}
        </Popper>
      </Grid>
    </ClickAwayListener>
  );
}

export default Datepicker;
