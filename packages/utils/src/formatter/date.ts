import { format, getDaysInMonth } from 'date-fns';

export const formatDateToOrdinal = (date: string | Date) =>
  format(new Date(date), 'do MMMM yyyy');

export const getMaxDaysByMonthDigits = (month: number) => {
  const thirtyDays = [4, 6, 9, 11];
  let maxDays = 31;
  if (thirtyDays.includes(month)) {
    maxDays = 30;
  } else if (month === 2) {
    maxDays = 29;
  }
  return maxDays;
};
export const getValidDate = (days: string, value: any) => {
  const month = parseInt(value.substring(2, 4), 10);
  const year = parseInt(value.substring(4, 8), 10);
  let maxDays = getMaxDaysByMonthDigits(month);
  let validDays = days;
  if (!Number.isNaN(month) && !Number.isNaN(year) && year > 999) {
    maxDays = getDaysInMonth(new Date(year, month - 1));
  }

  const prefix = days.slice(0, 1);
  if (days === '00') {
    validDays = '01';
  } else if (parseInt(prefix, 10) > 3 && days.length === 1) {
    validDays = `0${days}`;
  } else if (parseInt(days, 10) > maxDays) {
    validDays = maxDays.toString();
  }
  return validDays;
};

export const getValidMonth = (month: string) => {
  const prefix = month.slice(0, 1);
  let validMonth = month;
  if (month === '00') {
    validMonth = '01';
  } else if (parseInt(prefix, 10) > 1) {
    validMonth = `0${month}`;
  } else if (parseInt(month, 10) > 12) {
    validMonth = '12';
  }
  return validMonth;
};

export const formatDateInput = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  const { length } = numericValue;

  if (length === 0) {
    return '';
  }

  const days = getValidDate(numericValue.substring(0, 2), numericValue) as any;
  const month = length > 2 ? getValidMonth(numericValue.substring(2, 4)) : '';
  const year = length > 4 ? numericValue.substring(4, 8) : '';

  if (length <= 2) {
    // When the user finishes typing the day, append the first slash.
    return `${days}${length === 2 ? '/' : ''}`;
  }

  if (length <= 4) {
    // When the user finishes typing the month, append the second slash.
    return `${days}/${month}${length === 4 ? '/' : ''}`;
  }

  return `${days}/${month}/${year}`.slice(0, 10);
};
