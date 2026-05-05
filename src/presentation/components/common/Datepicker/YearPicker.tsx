import { Grid } from '@material-ui/core';
import { format, getYear } from 'date-fns';
import * as React from 'react';

import { getLanguage, getString } from 'presentation/theme/localization';

interface YearPickerProps {
  minYear?: number;
  maxYear?: number;
  selectedDate?: Date;
  locale?: Locale;
  handlerClick: (date: Date) => void;
}

function YearPicker({
  minYear = getYear(new Date()) - 100,
  maxYear = getYear(new Date()),
  selectedDate,
  locale,
  handlerClick,
}: YearPickerProps) {
  const getSelectedYear = selectedDate ? getYear(selectedDate) : null;
  const getSelectedMonth = selectedDate
    ? format(selectedDate, 'LLLL', { locale })
    : null;
  const isThai = getLanguage() === 'th';
  const yearDisplay = getSelectedYear ?? maxYear;
  const monthDisplay = getSelectedMonth ?? '';
  const yearList = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => i + minYear
  );

  const handlerYearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const yearSelected: number = event.currentTarget.value
      ? parseInt(event.currentTarget.value, 10)
      : maxYear;
    const setSelectedYear = selectedDate
      ? new Date(selectedDate.setFullYear(yearSelected))
      : new Date(yearSelected, 1, 1);
    handlerClick(setSelectedYear);
  };

  return (
    <Grid className="customYearPicker">
      <div className="header">
        {monthDisplay !== '' && (
          <>
            {monthDisplay}
            &nbsp;
          </>
        )}
        {yearDisplay}
        &nbsp;
        {isThai && getString('text.yearChristianEra')}
      </div>
      <div className="yearPickerList" role="contentinfo">
        {yearList &&
          yearList.length > 0 &&
          yearList.map((year) => {
            const currentYearClass = year === maxYear ? 'thisYear' : '';
            const selectedYearClass =
              year === getSelectedYear ? 'selected' : '';
            return (
              <button
                key={year}
                type="button"
                className={`yearItem ${selectedYearClass} ${currentYearClass}`}
                value={year}
                onClick={handlerYearClick}
              >
                {year}
              </button>
            );
          })}
      </div>
    </Grid>
  );
}

export default YearPicker;
