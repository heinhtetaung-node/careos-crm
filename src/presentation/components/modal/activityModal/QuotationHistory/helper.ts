import { format, DateType } from 'utils/datetime';

export interface IQuotationHistory {
  name: string;
  link: string;
  createTime: string;
  expireTime: string;
  createdBy: string;
}

export const displayTimestamp = (timestamp: { value: DateType }) =>
  format(new Date(timestamp.value), 'dd/MM/yyyy (hh:mm:ss a)');
