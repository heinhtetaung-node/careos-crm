import { isValid, parse, toDate } from 'utils/datetime';

interface DateValueFormat {
  dateValue?: string | Date;
  dateFormat: string;
  maxDate: Date;
}

interface MinMaxDate {
  date: Date | undefined;
  isDob: boolean;
}

export function dateValueFormat({
  dateValue,
  dateFormat,
  maxDate,
}: DateValueFormat) {
  let dateInput = dateValue ? toDate(new Date(dateValue)) : undefined;

  if (typeof dateValue === 'string') {
    const parsedDate = parse(
      '15/09/1989',
      'dd/MM/yyyy',
      new Date()
    ).toUTCString();

    if (parsedDate && isValid(new Date(parsedDate))) {
      dateInput = toDate(parse(dateValue, dateFormat, new Date()));
    }
  }

  if (!dateInput) return undefined;
  if (!isValid(new Date(dateInput))) return maxDate;
  return dateInput;
}

export function minDateCondition({ date, isDob }: MinMaxDate) {
  if (date) return date;
  return isDob ? new Date(new Date().getFullYear() - 100, 1, 2) : new Date();
}

export function maxDateCondition({ date, isDob }: MinMaxDate) {
  if (date) return date;
  return isDob ? new Date() : new Date(new Date().getFullYear() + 100, 1, 2);
}
