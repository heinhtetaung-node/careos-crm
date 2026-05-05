import { getString } from 'presentation/theme/localization';
import { DateType, isValid } from 'utils/datetime';

export const getBirthDateError = (age: number) => {
  if (Number.isNaN(age)) {
    return getString('errors.invalidValue');
  }
  return getString(
    age < 18 ? 'errors.invalidAgeUnder' : 'errors.invalidAgeOver'
  );
};

export const getDateError = () => getString('errors.invalidValue');

export const getDateObj = (input: DateType) =>
  isValid(new Date(input)) ? new Date(input) : 'Invalid Date';

export function isCharContain(str: string): boolean {
  return /\S/.test(str);
}
