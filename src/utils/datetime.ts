import {
  set,
  isValid,
  parse,
  add,
  addDays,
  sub,
  subDays,
  format,
  formatISO,
  isAfter,
  isBefore,
  getUnixTime,
  differenceInDays,
  differenceInYears,
  differenceInWeeks,
  isSameDay,
  isSameWeek,
  toDate,
  getDate,
  startOfDay,
  endOfDay,
  intervalToDuration,
  addHours,
  addYears,
  startOfWeek,
} from 'date-fns';
import {
  format as formatWithTZ,
  zonedTimeToUtc,
  utcToZonedTime,
  formatInTimeZone,
} from 'date-fns-tz';

export type DateType = string | number | Date;

/** This was support to stripe timezone effect from the datestring and return a Date object
 * Evertying you pass in as time will be forced to set as local time.
 * Currently only support ISO date string format.
 * @param {string} date The iso date string
 * @returns {Date} the date object
 */
export const stripTimezone = (date: string) => new Date(date.slice(0, 19));

/**
 * This test the date is in the provided format or not and is valid date
 * @param {string} date the date string to test
 * @param {string} format format string that should be test
 * @returns {boolean} is the date is valid or not
 */
export const isValidDateFormat = (date: string, dateFormat: string) => {
  const parseDate = parse(date, dateFormat, new Date());
  return isValid(parseDate);
};

/**
 * Returns date in format passed or returns null if date is invalid
 * @param date if short date, pass in the format of MM/dd/yyyy. Read this https://www.w3schools.com/js/js_date_formats.asp
 * @param dateFormat pass the format you want the date to be converted.
 * @returns formatted date or null
 */
const formatDate = (date: DateType, dateFormat: string) => {
  const isValidDate = isValid(new Date(date));
  if (isValidDate) {
    return format(new Date(date), dateFormat);
  }
  return null;
};

/**
 * Returns date equivalent of moment().utc()
 * @param date if short date, pass in the format of MM/dd/yyyy. Read this https://www.w3schools.com/js/js_date_formats.asp
 * @returns formatted date or empty string
 */
export const momentUTCEquivalent = (time: DateType) =>
  time && isValid(new Date(time))
    ? utcToZonedTime(new Date(time), 'UTC').toISOString()
    : '';

/**
 * Transform date format as you want
 * @param date date string that you want to transform
 * @param currentFormat format that you get right now (Should be with DD MM YYYY)
 * @param expectedFormat format that you want to transform (Should be with DD MM YYYY)
 * @param delimeter should only / or -
 * transformDateFormat('01/12/2019', 'DD/MM/YYYY', 'MM/DD/YYYY', '/')); // "12/01/2019"
 * transformDateFormat('01/12/2019')); // "12/01/2019"
 * transformDateFormat('2019/12/01', 'YYYY/MM/DD', 'DD/MM/YYYY', '/')); // "01/12/2019"
 * transformDateFormat('01/31/2018', 'MM/DD/YYYY', 'DD/MM/YYYY', '/')); // "31/01/2018"
 */
export const transformDateFormat = (
  date: string,
  currentFormat: string = 'DD/MM/YYYY', // DD/MM/YYYY or MM/DD/YYYY
  expectedFormat: string = 'MM/DD/YYYY', // DD/MM/YYYY or MM/DD/YYYY
  delimeter: '/' | '-' = '/'
): null | string => {
  try {
    const dateArr = date.split(delimeter);
    const currentFormatArr = currentFormat.split(delimeter);

    const currentDD = dateArr[currentFormatArr.indexOf('DD')];
    const currentMM = dateArr[currentFormatArr.indexOf('MM')];
    const currentYYYY = dateArr[currentFormatArr.indexOf('YYYY')];

    const finalDate = expectedFormat
      .replace('DD', currentDD)
      .replace('MM', currentMM)
      .replace('YYYY', currentYYYY);

    return finalDate;
  } catch (_err) {
    return null;
  }
};

// We should import these from this file so later when we update the library we can update the library in one place
export {
  set,
  isValid,
  add,
  sub,
  addDays,
  subDays,
  format,
  formatISO,
  isAfter,
  isBefore,
  getUnixTime,
  differenceInDays,
  differenceInYears,
  differenceInWeeks,
  isSameDay,
  isSameWeek,
  toDate,
  parse,
  getDate,
  startOfDay,
  endOfDay,
  intervalToDuration,
  formatDate,
  zonedTimeToUtc,
  utcToZonedTime,
  formatWithTZ,
  formatInTimeZone,
  addHours,
  addYears,
  startOfWeek,
};
