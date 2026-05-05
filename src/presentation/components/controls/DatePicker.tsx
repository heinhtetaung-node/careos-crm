import { InputAdornment } from '@material-ui/core';
import DateRangeIcon from '@material-ui/icons/DateRange';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

import { thaiDateFormat } from 'shared/helper/thaiDateFormat';

import Input from './Input';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.scss';

function DateInputPicker() {
  const [startDate, setStartDate] = useState(new Date());
  const [openDatePicker, setOpennDatePicker] = useState(false);

  const openCloseCalendar = () => {
    setOpennDatePicker(!openDatePicker);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    const { currentTarget } = e;
    setTimeout(() => {
      if (!currentTarget.contains(document.activeElement)) {
        openCloseCalendar();
      }
    }, 0);
  };

  return (
    <div onBlur={handleBlur} className="container-datepicker">
      <Input
        generic
        name="date"
        value={thaiDateFormat(startDate.toString())}
        onFocus={openCloseCalendar}
        autoComplete="off"
        variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <DateRangeIcon
                onClick={openCloseCalendar}
                className="calendar-icon"
              />
            </InputAdornment>
          ),
        }}
      />
      <div style={{ display: !openDatePicker ? 'none' : '' }}>
        <DatePicker
          selected={startDate}
          onChange={(date: any) => setStartDate(date)}
          inline
        />
      </div>
    </div>
  );
}

export default DateInputPicker;
