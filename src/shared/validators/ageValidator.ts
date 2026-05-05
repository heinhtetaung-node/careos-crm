import { format, differenceInYears, isValid } from 'date-fns';

const isMaxAge = (date: string | Date) => {
  if (!isValid(date)) return false;

  const maxYear = 100;
  const years = differenceInYears(
    new Date(format(new Date(), 'yyyy').toString()),
    new Date(format(new Date(date), 'yyyy').toString())
  );

  return years > maxYear;
};

const isMinAge = (date: string | Date) => {
  if (!isValid(date)) return false;

  const minYear = 18;
  const years = differenceInYears(
    new Date(format(new Date(), 'yyyy').toString()),
    new Date(format(new Date(date), 'yyyy').toString())
  );

  return years < minYear;
};

export { isMaxAge, isMinAge };
