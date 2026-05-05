import { dateValueFormat } from './helper';

const dateFormat = 'MM/dd/yyyy';
const maxDate = new Date('2022/07/18');

test('Should convert to date if input is string', () => {
  const dateConvert = dateValueFormat({
    dateValue: '09/15/1923',
    dateFormat,
    maxDate,
  });
  expect(dateConvert).toBeInstanceOf(Date);
  expect(dateConvert).toEqual(new Date('09/15/1923'));
});

test('Should return undefined if dateValue is undefined', () => {
  const dateConvert = dateValueFormat({
    dateValue: undefined,
    dateFormat,
    maxDate,
  });
  expect(dateConvert).toBe(undefined);
});

test('Should return maxDate if date is invalid', () => {
  const dateConvert = dateValueFormat({
    dateValue: '40/12/1989',
    dateFormat,
    maxDate,
  });
  expect(dateConvert).toBe(maxDate);
});

test('Should return dateValue if valid dateValue Date is passed', () => {
  const dateNow = new Date();
  const dateConvert = dateValueFormat({
    dateValue: dateNow,
    dateFormat,
    maxDate,
  });

  expect(dateConvert).toEqual(dateNow);
});
