import {
  thaiDateFormatV2,
  THAI_YEAR_DIFFERENCE,
} from 'shared/helper/thaiDateFormat';
import { format, isValid } from 'utils/datetime';

export const getDateFormatWithThaiYear = (date: any) => {
  if (!date || !isValid(new Date(date))) return 'dd/MM/yyyy';

  const year = new Date(date).getFullYear();
  return `dd/MM/yyyy (${year + THAI_YEAR_DIFFERENCE})`;
};

export const formatDate = (date: any, showThaiYear: boolean) => {
  if (isValid(new Date(date))) {
    return showThaiYear
      ? thaiDateFormatV2(date)
      : format(new Date(date), 'dd/MM/yyyy');
  }
  return '';
};
