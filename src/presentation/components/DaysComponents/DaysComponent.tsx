import { Grid } from '@material-ui/core';
import React, { useEffect, useMemo, useState } from 'react';

import { dayComponent } from 'models/DayComponent';
import { differenceInDays } from 'utils/datetime';

import DaysComponentHelper from './DaysComponentHelper';

import DayComponent from '../dayComponent/DayComponent';
import DaysComponentWrapper from '../DaysComponentWrapper/DaysComponentWrapper';

import './DaysComponent.scss';

interface IProps {
  numberOfDays: number | string;
  daysDataArray: Array<dayComponent>;
  selectedDate?: string;
  isLoading: boolean;
  onSelect: (day: dayComponent) => any;
  onChange: (action: string) => any;
}

const daysDataHelper = new DaysComponentHelper();

function DaysComponent({
  isLoading,
  selectedDate,
  daysDataArray,
  onSelect,
  onChange,
}: Readonly<IProps>) {
  const [isHaveToday, setIsHaveToday] = useState<boolean>(false);
  const [daysData, setDaysData] = useState<Array<dayComponent>>([]);

  const getDaysListData = () => {
    const daysList = daysDataHelper.getDaysArray(daysDataArray, selectedDate);
    const isHasToday = daysDataHelper.isHasToday(daysDataArray);
    daysList.map((item) => {
      if (item.isActive) {
        onSelect(item);
      }
      return item;
    });
    setDaysData(daysList);
    setIsHaveToday(isHasToday);
  };

  useEffect(() => {
    getDaysListData();
  }, [daysDataArray, selectedDate]);

  const handelSelectDay = (dayData: dayComponent) => {
    const dayIndex = daysData.indexOf(dayData);
    const newDaysData = daysData.map((day, index) => {
      const newDay = day;
      newDay.isActive = dayIndex === index;
      return newDay;
    });

    setDaysData(newDaysData);
    onSelect(dayData);
  };

  const renderDay = useMemo(
    () =>
      daysData.map((day: dayComponent) => {
        const tempDate = new Date(day.date);
        const isPreviousDate = differenceInDays(tempDate, new Date()) < 0;

        return (
          <DayComponent
            key={day.date.toString()}
            data={day}
            isLoading={isLoading}
            onSelect={handelSelectDay}
            isDisabled={isPreviousDate}
          />
        );
      }),
    [daysData, isLoading]
  );

  return (
    <DaysComponentWrapper onNextPrevious={onChange} isHaveToday={isHaveToday}>
      <Grid container className="shared-days-component">
        <div className="shared-days-component__container">{renderDay}</div>
      </Grid>
    </DaysComponentWrapper>
  );
}

export default DaysComponent;
