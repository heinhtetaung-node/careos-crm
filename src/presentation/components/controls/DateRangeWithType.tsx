import { Grid } from '@material-ui/core';
import React, { ChangeEvent, useEffect, useMemo, useState } from 'react';

import { SelectElement } from 'shared/types/controls';

import Controls from './Control';
import { isFocusDateRange$ } from './Services/serviceHandleDateRangeCollapse';
import './DateRangeWithType.scss';

interface IProps {
  value: any;
  name: string;
  label: string;
  className?: string;
  selectName: string;
  options: Array<any>;
  fixedLabel: boolean;
  disabledDay?: (date: Date) => boolean;
  onChange: (field: string, params: any) => void;
}

function DateRangeWithType({
  name,
  label,
  value,
  options,
  onChange,
  selectName,
  disabledDay,
  className = '',
  fixedLabel = false,
}: IProps) {
  const [data, setFormData] = useState({
    criteria: '',
    range: { startDate: null, endDate: null },
  });

  const [disableDateRange, setDisableDateRange] = useState(true);

  useMemo(() => {
    setFormData(value);
  }, [value]);

  useEffect(() => {
    if (value?.criteria && disableDateRange) {
      setDisableDateRange(value.criteria.trim() === '');
    }
  }, [value?.criteria]);

  const setParentData = (criteriaVal: any, rangeVal: any) => {
    onChange(name, {
      range: rangeVal ?? data.range,
      criteria: criteriaVal !== undefined ? criteriaVal : data.criteria,
    });
  };

  const handleDatepickerChange = (e: ChangeEvent<SelectElement>) => {
    const { value: rangeVal }: any = e.target;
    setParentData(undefined, rangeVal);
  };

  const handleSelectTypeDateChange = (e: ChangeEvent<SelectElement>) => {
    const { value: criteria }: any = e.target;
    setDisableDateRange(criteria.trim() === '');
    setParentData(criteria, undefined);
  };

  const handleOnclickDateRange = (e: ChangeEvent | any) => {
    isFocusDateRange$.next(e);
  };

  return (
    <div tabIndex={-1} className={`shared-date-range-picker ${className}`}>
      <Grid item xs={6} className="display-flex-md">
        <Controls.Select
          label={label}
          name={selectName}
          options={options}
          selectField="value"
          value={data.criteria}
          fixedLabel={fixedLabel}
          onChange={handleSelectTypeDateChange}
        />
      </Grid>
      <Grid item xs={6} className="display-flex-md">
        <Controls.DateRange
          name="dateRange"
          value={data.range}
          fixedLabel={fixedLabel}
          className="calendar-date-range"
          onChange={handleDatepickerChange}
          handleOnclickDateRange={handleOnclickDateRange}
          disabledDay={disabledDay}
          disabled={disableDateRange}
        />
      </Grid>
    </div>
  );
}

export default DateRangeWithType;
