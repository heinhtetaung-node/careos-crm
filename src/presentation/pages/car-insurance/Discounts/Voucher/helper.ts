import { format } from 'date-fns';
import isNaN from 'lodash/isNaN';

import { bahtToSatang } from 'utils/currency';

export const handleFormatDate = (dateTime: string, isOld = false) =>
  `${format(new Date(dateTime), 'yyyy-MM-dd')}${
    isOld ? 'T00:00:00Z' : 'T23:59:59Z'
  }`;

export const formatDateToURI = (
  values: Record<
    string,
    { criteria: string; range: { startDate: string; endDate: string } }
  >
) => {
  const filter: Record<string, string> = {};
  Object.entries(values).forEach(([_key, _values]: any) => {
    const { criteria, range } = _values;
    if (criteria !== '') {
      filter[criteria] = `${criteria}>="${handleFormatDate(
        range.startDate,
        true
      )}" ${criteria}<="${handleFormatDate(range.endDate)}"`;
    }
  });
  return filter;
};

export const formatFilterURI: (payload: Record<string, any>) => string = (
  payload
) => {
  let filter: any = {};

  Object.entries(payload).forEach(([keys, values]: any) => {
    if (keys === 'search') {
      const { key, value }: { key: string; value: string } = values;
      if (value) {
        filter[key] = value;
      }
      return;
    }
    if (keys === 'date') {
      filter = { ...filter, ...formatDateToURI(values) };
      return;
    }
    if (values) {
      filter[keys] = values;
    }
  });

  if (payload.voucherType === 'cash') {
    if (filter.price) {
      filter.price = bahtToSatang(filter.price);
    }
    delete filter.percentDiscount;
  } else if (payload.voucherType === 'percent') {
    if (filter.percentDiscount) {
      filter.percentDiscount *= 100;
    }
    delete filter.price;
  }

  return Object.keys(filter)
    .map((key) => {
      if (['startTime', 'endTime'].includes(key)) {
        return filter[key];
      }
      const val = isNaN(Number(filter[key])) ? `"${filter[key]}"` : filter[key];
      return `${key}=${val}`;
    })
    .join(' ');
};
