import {
  convertDateTime,
  formatTime12Hours,
  convertDateDDMMYY,
} from 'shared/helper/convertDateTime';

const DateISO = '2020-11-17T10:29:06.739Z';

const Time12Hours = new Date(DateISO);

const getEqualToCompare = () => {
  const time = new Date('2020-11-17T10:29:06.739Z').toLocaleTimeString(
    undefined,
    {
      hour: 'numeric',
      hour12: true,
      minute: 'numeric',
      second: 'numeric',
    }
  );

  return `17/11/2020 (${time})`.toUpperCase();
};

test('Valid ISO Date String', () => {
  expect(convertDateTime(DateISO).toUpperCase()).toEqual(
    getEqualToCompare().toUpperCase()
  );
});

test('Valid Time convert 12 Hours system', () => {
  expect(
    formatTime12Hours(new Date('07/02/2022 09:05:36 am')).toUpperCase()
  ).toEqual(
    new Date('07/02/2022 09:05:36 am')
      .toLocaleTimeString(undefined, {
        hour: 'numeric',
        hour12: true,
        minute: 'numeric',
        second: 'numeric',
      })
      .toUpperCase()
  );
});

test('Valid date convert to dd/mm/yy format', () => {
  expect(convertDateDDMMYY(Time12Hours)).toEqual('17/11/2020');
});
