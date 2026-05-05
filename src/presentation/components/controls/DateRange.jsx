import { InputAdornment } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import DateRangeIcon from '@material-ui/icons/DateRange';
import {
  addDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
  format,
} from 'date-fns';
import React, { useMemo, useState } from 'react';
import { DateRangePicker, createStaticRanges } from 'react-date-range';

import Input from './Input';

import { getString } from '../../theme/localization';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './DateRangeWithType.scss';

const defineds = {
  startOfToday: startOfDay(new Date()),
  endOfToday: endOfDay(new Date()),
  startOfWeek: startOfWeek(new Date()),
  endOfWeek: endOfWeek(new Date()),
  startOfMonth: startOfMonth(new Date()),
  endOfMonth: endOfMonth(new Date()),

  startOfLast7Day: startOfDay(addDays(new Date(), -7)),
  endOfLast7Day: endOfDay(addDays(new Date(), -1)),
  startOfLast14Day: startOfDay(addDays(new Date(), -14)),
  endOfLast14Day: endOfDay(addDays(new Date(), -1)),
  startOfLast30Day: startOfDay(addDays(new Date(), -30)),
  endOfLast30Day: endOfDay(addDays(new Date(), -1)),

  startOfYesterday: startOfDay(addDays(new Date(), -1)),
  endOfYesterday: endOfDay(addDays(new Date(), -1)),
  startOfLastWeek: startOfWeek(addDays(new Date(), -7)),
  endOfLastWeek: endOfWeek(addDays(new Date(), -7)),
  startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
  endOfLastMonth: endOfMonth(addMonths(new Date(), -1)),

  startOfLifeTime: startOfDay(new Date()),
  endOfLifeTime: endOfDay(new Date()),
};

const initialRange = {
  range: {
    startDate: null,
    endDate: null,
  },
};

function DateRange({
  onChange,
  value,
  name,
  className,
  handleOnclickDateRange,
  label = getString('text.date'),
  disabledDay = (_date) => false,
  fixedLabel = false,
  disabled = false,
}) {
  const [calOpen, setCalOpen] = useState(false);
  const [inputVal, setInputVal] = useState();
  const [ranges, setRanges] = useState(initialRange);

  const formatDateValue = ({ startDate, endDate }) =>
    startDate && endDate
      ? `${format(startDate || value.startDate, 'dd/MM/yyyy')} - 
    ${format(endDate || value.endDate, 'dd/MM/yyyy')}`
      : '';

  useMemo(() => {
    setRanges(value);
    setInputVal(formatDateValue(value));
  }, [value]);

  const staticRanges = createStaticRanges([
    {
      label: getString('datePicker.today'),
      range: () => ({
        startDate: defineds.startOfToday,
        endDate: defineds.endOfToday,
      }),
    },
    {
      label: getString('datePicker.yesterday'),
      range: () => ({
        startDate: defineds.startOfYesterday,
        endDate: defineds.endOfYesterday,
      }),
    },
    {
      label: getString('datePicker.last7Days'),
      range: () => ({
        startDate: defineds.startOfLast7Day,
        endDate: defineds.endOfLast7Day,
      }),
    },
    {
      label: getString('datePicker.last14Days'),
      range: () => ({
        startDate: defineds.startOfLast14Day,
        endDate: defineds.endOfLast14Day,
      }),
    },
    {
      label: getString('datePicker.last30Days'),
      range: () => ({
        startDate: defineds.startOfLast30Day,
        endDate: defineds.endOfLast30Day,
      }),
    },
    {
      label: getString('datePicker.thisWeek'),
      range: () => ({
        startDate: defineds.startOfWeek,
        endDate: defineds.endOfWeek,
      }),
    },
    {
      label: getString('datePicker.thisMonth'),
      range: () => ({
        startDate: defineds.startOfMonth,
        endDate: defineds.endOfMonth,
      }),
    },
    {
      label: getString('datePicker.lastMonth'),
      range: () => ({
        startDate: defineds.startOfLastMonth,
        endDate: defineds.endOfLastMonth,
      }),
    },
    {
      label: getString('datePicker.lifeTime'),
      range: () => ({
        startDate: defineds.startOfLifeTime,
        endDate: defineds.endOfLifeTime,
      }),
    },
  ]);

  const syncData = () => {
    const startDate = value.startDate || Date.now();
    if (!value.endDate) {
      onChange({
        target: {
          name,
          value: {
            startDate: startOfDay(startDate),
            endDate: endOfDay(startDate),
          },
        },
      });
    }
  };

  const openCalendar = () => {
    if (disabled) return;
    syncData();
    handleOnclickDateRange(true);
    setCalOpen(true);
  };

  const closeCalendar = () => {
    syncData();
    handleOnclickDateRange(false);
    setCalOpen(false);
  };

  const onRangeChange = (dateRange) => {
    const {
      range1: { startDate, endDate },
    } = dateRange;

    onChange({
      target: {
        name,
        value: { startDate: startOfDay(startDate), endDate: endOfDay(endDate) },
      },
    });
  };

  const handleBlur = (e) => {
    const { currentTarget } = e;
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        closeCalendar();
      }
    }, 0);
  };

  return (
    <div className="shared-date-range-picker">
      <div
        tabIndex="1"
        onBlur={handleBlur}
        className={`${className} calendar-date-range relative`}
      >
        <Input
          generic
          name="date"
          label={label}
          value={inputVal}
          onFocus={openCalendar}
          autoComplete="off"
          fixedLabel={fixedLabel}
          placeholder={getString('text.datePickerPlaceholder')}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <DateRangeIcon
                  onClick={openCalendar}
                  className="cursor-pointer"
                />
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
          disabled={disabled}
        />
        <div className={`form-date ${!calOpen && 'hidden'}`}>
          <DateRangePicker
            onChange={onRangeChange}
            showSelectionPreview
            moveRangeOnFirstSelection={false}
            editableDateInputs={false}
            months={2}
            ranges={[ranges]}
            direction="horizontal"
            headerContent={
              <>
                <div className="rdrDefinedRangesWrapper__header">
                  {getString('text.datePresets')}
                </div>
                <div className="close-btn">
                  <Close onClick={closeCalendar} />
                </div>
              </>
            }
            inputRanges={[]}
            staticRanges={staticRanges}
            disabledDay={disabledDay}
          />
        </div>
      </div>
    </div>
  );
}
export default DateRange;
