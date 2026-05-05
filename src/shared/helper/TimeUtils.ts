import { format } from 'date-fns';

import { DateTimeFormat } from '../constants/index';

export default class TimeUtils {
  public static formatCustomOptionDateTime = (date: Date): string =>
    format(date, DateTimeFormat.FullDateTime);

  public static formatCustomOptionDate = (date: Date): string =>
    format(date, DateTimeFormat.FullDate);

  public static formatCustomOptionTime = (date: Date): string =>
    format(date, DateTimeFormat.Time);

  public static format24 = (date: string): string =>
    date ? format(new Date(date), DateTimeFormat.DateTime24h) : '';

  public static fullDate = (date: string): string =>
    date ? format(new Date(date), DateTimeFormat.FullDate) : '';

  public static formatCustomOption = (
    date: string,
    formatString: string
  ): string => (date ? format(new Date(date), formatString) : '');
}
