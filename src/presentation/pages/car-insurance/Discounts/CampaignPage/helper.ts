import { formatDateToURI } from '../Voucher/helper';

/* eslint-disable import/prefer-default-export */
export const formatFilterURI: (payload: Record<string, any>) => string = (
  payload
) => {
  let filter: any = {};

  Object.entries(payload).forEach(([keys, values]: any) => {
    if (keys === 'discountPercentage' && values[1]) {
      filter[keys] = `${keys}>=${values[0] * 100} ${keys}<=${values[1] * 100}`;
      return;
    }
    if (keys === 'search') {
      const { key, value }: { key: string; value: string } = values;
      if (value) {
        filter[key] = `"${value}"`;
      }
      return;
    }
    if (keys === 'date') {
      filter = { ...filter, ...formatDateToURI(values) };
      return;
    }
    if (keys === 'approver' && values.length) {
      filter[keys] = values === '-' ? 'TRUE' : `"${values}"`;
    }
  });

  return Object.keys(filter)
    .map((key) => {
      if (
        !['startDate', 'endDate', 'discountPercentage', 'approver'].includes(
          key
        ) ||
        (key === 'approver' && filter[key] !== 'TRUE')
      ) {
        return `${key}=${filter[key]}`;
      }
      if (key === 'approver' && filter[key] === 'TRUE') {
        return `${key}!!${filter[key]}`;
      }
      return filter[key];
    })
    .join(' ');
};
