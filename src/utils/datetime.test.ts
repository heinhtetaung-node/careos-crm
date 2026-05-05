import { isValidDateFormat, formatDate, transformDateFormat } from './datetime';

describe('Test isValidDateFormat', () => {
  it('Should return true if date is valid', () => {
    expect(isValidDateFormat('11/11/2020', 'dd/MM/yyyy')).toEqual(true);
  });
  it('Should return true if date is invalid', () => {
    expect(isValidDateFormat('02/20/2020', 'dd/MM/yyyy')).toEqual(false);
  });
});

describe('Test formatDate', () => {
  it('Should return date in the format passed', () => {
    expect(formatDate('02/14/1991', 'dd-MM-yyyy')).toEqual('14-02-1991');
  });

  it('Should return date in the format passed', () => {
    expect(formatDate('2022-06-17T03:44:18.026094Z', 'dd-MM-yyyy')).toEqual(
      '17-06-2022'
    );
  });

  it('Should return null if date passed is in incorrect format(correct format is MM/dd/yyyy)', () => {
    expect(formatDate('20/02/2020', 'dd-MM-yyyy')).toEqual(null);
  });
});

describe('Test transformDateFormat', () => {
  it('Should transform various date', () => {
    expect(
      transformDateFormat('01/12/2019', 'DD/MM/YYYY', 'MM/DD/YYYY', '/')
    ).toEqual('12/01/2019');
    expect(transformDateFormat('01/12/2019')).toEqual('12/01/2019');
    expect(
      transformDateFormat('2019/12/01', 'YYYY/MM/DD', 'DD/MM/YYYY', '/')
    ).toEqual('01/12/2019');
    expect(
      transformDateFormat('01/31/2018', 'MM/DD/YYYY', 'DD/MM/YYYY', '/')
    ).toEqual('31/01/2018');
  });
});
