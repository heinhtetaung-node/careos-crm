/* eslint-disable class-methods-use-this */
import { dayComponent } from 'models/DayComponent';
import { isSameDay, format } from 'utils/datetime';

export default class DaysComponentHelper {
  getDaysArray(
    daysDataArray: Array<dayComponent>,
    selectedDate: string | undefined
  ) {
    let newDaysData: Array<dayComponent> = [];
    if (daysDataArray.length) {
      const isHasToday = !!daysDataArray.filter((day) =>
        isSameDay(new Date(), new Date(day.date))
      ).length;

      const isInDateRange = daysDataArray.find(
        (day) => day.date === selectedDate
      );
      if (selectedDate && isInDateRange) {
        newDaysData = daysDataArray.map((day) => {
          const newDay = day;
          // INFO: set active for the day which is selected day
          newDay.isActive = isSameDay(
            new Date(selectedDate),
            new Date(day.date)
          );
          return newDay;
        });
      } else if (isHasToday) {
        newDaysData = daysDataArray.map((day) => {
          const newDay = day;
          // INFO: set active for the day which is today
          newDay.isActive = isSameDay(new Date(), new Date(day.date));
          return newDay;
        });
      } else {
        newDaysData = daysDataArray.map((day, index) => {
          const newDay = day;
          // INFO: set active for the first day
          newDay.isActive = index === 0;
          return newDay;
        });
      }
    }
    return newDaysData;
  }

  isHasToday(daysData: Array<dayComponent>) {
    const tmpDaysList = daysData;
    const currentDay = format(new Date(), 'yyyy-MM-dd');

    const hasToday = tmpDaysList.find(
      (matchedItem) => matchedItem.date === currentDay
    );
    return !!hasToday;
  }
}
