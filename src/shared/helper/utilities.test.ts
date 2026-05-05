import { differenceInYears } from 'date-fns';

import {
  sleep,
  convertToIdTitle,
  millisToMinutesAndSeconds,
  toBuddhistYear,
  thaiDateFormat,
  thaiYearFormat,
  capitalizeFirstLetter,
  countingAgeToPresent,
  changeSortStatus,
  SORT_TABLE_TYPE,
  getOrderByField,
  isInvalidCharacters,
  hasSpecialChar,
  isNotANum,
  getRenewalPackageStatus,
  getLeadIdFromPath,
  getLeadIdFromLeadName,
  getYesNoOptions,
  leadTypeText,
  NewDateFormatters,
  formatDDMMYYYY,
  formatDDMMYYYYHHMMSS,
  formatDDMMYYYYHHMMSSUTC,
  maskPhoneNumber,
  maskEmailAddress,
  formatCurrency,
  formatDate,
} from './utilities';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

describe('Render Utilities', () => {
  test('sleep should wait for given sec to resolve', () => {
    sleep(100);
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });

  test('should render convertToIdTitle with passed Arr', () => {
    const oldArr = [
      {
        id: 1,
        name: 'Rabbit Tech',
      },
    ];
    const resultData = convertToIdTitle(oldArr);
    expect(resultData).not.toEqual(oldArr);
  });

  test('should render convertToIdTitle with blank Arr', () => {
    const resultData = convertToIdTitle([]);
    expect(resultData).toEqual([]);
  });

  test('should render millisToMinutesAndSeconds', () => {
    const resultData = millisToMinutesAndSeconds(20000);
    expect(resultData).not.toEqual(20000);
  });

  test('should display the Buddhist Year', () => {
    const resultData = toBuddhistYear(new Date('10/10/2020'));
    expect(resultData).toEqual('10/10/2020 (2563) <br/> ( 00:00:00 PM )');
  });

  test('should render toBuddhistYear', () => {
    const resultData = toBuddhistYear(new Date());
    expect(resultData).not.toEqual(new Date());
  });
});

describe('Test thaiDateFormat', () => {
  test('should not render thaiDateFormat', () => {
    const resultData = thaiDateFormat('2012-07-14T01:00:00+01:00');
    expect(resultData).not.toEqual('2012-07-14T01:00:00+01:00');
  });

  test('should render thaiDateFormat', () => {
    const resultData = thaiDateFormat('2012-07-14T01:00:00+01:00');
    expect(resultData).toEqual('14 / 07 / 2012 (2555)');
  });
});

describe('Test thaiYearFormat', () => {
  test('should not render thaiYearFormat', () => {
    const resultData = thaiYearFormat('2012-07-14T01:00:00+01:00');
    expect(resultData).not.toEqual('2012-07-14T01:00:00+01:00');
  });

  test('should render thaiYearFormat', () => {
    const resultData = thaiYearFormat('2012-07-14T01:00:00+01:00');
    expect(resultData).toEqual('2012 (2555)');
  });
});

describe('Test capitalizeFirstLetter', () => {
  test('should render capitalizeFirstLetter', () => {
    const resultData = capitalizeFirstLetter('rabbitTech');
    expect(resultData).toEqual('Rabbittech');
  });

  test('should not render capitalizeFirstLetter', () => {
    const resultData = capitalizeFirstLetter('rabbitTech');
    expect(resultData).not.toEqual('rabbitTech');
  });
});

describe('Test countingAgeToPresent', () => {
  test('should render countingAgeToPresent', () => {
    const date = '09/03/1994';
    const resultData = countingAgeToPresent(date);
    const yearDifference = differenceInYears(new Date(), new Date(date));
    expect(resultData).toEqual(yearDifference);
  });

  test('should not render countingAgeToPresent', () => {
    const resultData = countingAgeToPresent('09/03/1994');
    expect(resultData).not.toEqual(25);
  });
});

describe('Test changeSortStatus', () => {
  test('Should be return asc if input none status for sorting', () => {
    expect(changeSortStatus(SORT_TABLE_TYPE.NONE)).toEqual(SORT_TABLE_TYPE.ASC);
  });
  test('Should be return desc if input asc status for sorting', () => {
    expect(changeSortStatus(SORT_TABLE_TYPE.ASC)).toEqual(SORT_TABLE_TYPE.DESC);
  });
  test('Should be return none if input desc status for sorting', () => {
    expect(changeSortStatus(SORT_TABLE_TYPE.DESC)).toEqual(
      SORT_TABLE_TYPE.NONE
    );
  });
});

describe('Test getOrderByField', () => {
  test('Should be return order_by=order.humanId if input asc order for sorting', () => {
    expect(getOrderByField('order.humanId', SORT_TABLE_TYPE.ASC)).toEqual(
      'order_by=order.humanId'
    );
  });
  test('Should not be return order_by=order.humanId if input asc order for sorting', () => {
    expect(getOrderByField('order.humanId', SORT_TABLE_TYPE.NONE)).not.toEqual(
      'order_by=order.humanId'
    );
  });
});

describe('Test isInvalidCharacters', () => {
  it('Should be return true if input include number', () => {
    expect(isInvalidCharacters('test1')).toEqual(true);
  });
  it('Should return true if input includes special characters', () => {
    expect(isInvalidCharacters(':(')).toEqual(true);
  });
  it('Should return true if input includes emoji', () => {
    expect(isInvalidCharacters('😀')).toEqual(true);
  });
  it('Should return false if input is valid', () => {
    expect(isInvalidCharacters('Test')).toEqual(false);
  });
});

describe('Test hasSpecialChar', () => {
  it('Should return true if input includes special characters', () => {
    expect(hasSpecialChar(':(ow12')).toEqual(true);
  });
  it('Should return true if input includes emoji', () => {
    expect(hasSpecialChar('😀')).toEqual(true);
  });
  it('Should return false if input is valid', () => {
    expect(hasSpecialChar('Test')).toEqual(false);
    expect(hasSpecialChar('test1')).toEqual(false);
  });
});

describe('Test isNotANum', () => {
  it('Should return true if input includes non-numeric characters', () => {
    expect(isNotANum('22!a')).toEqual(true);
    expect(isNotANum('abc')).toEqual(true);
  });
  it('Should return true if input includes emoji', () => {
    expect(isNotANum('😀')).toEqual(true);
  });
  it('Should return false if input is valid', () => {
    expect(isNotANum('1001')).toEqual(false);
  });
});

describe('getRenewalPackageStatus', () => {
  it('Should return "renewalStatus.accepted" if status passed "ACCEPTED"', () => {
    expect(getRenewalPackageStatus('ACCEPTED')).toBe('renewalStatus.accepted');
  });

  it('Should return "renewalStatus.unspecified" if status passed "UNSPECIFIED"', () => {
    expect(getRenewalPackageStatus('UNSPECIFIED')).toBe(
      'renewalStatus.unspecified'
    );
  });

  it('Should return "renewalStatus.declined" if status passed "DECLINED"', () => {
    expect(getRenewalPackageStatus('DECLINED')).toBe('renewalStatus.declined');
  });

  it('Should return "renewalStatus.declined" if status passed "DECLINED"', () => {
    expect(getRenewalPackageStatus('DECLINED')).toEqual(
      'renewalStatus.declined'
    );
  });

  it('Should return empty string  if status passed "SUCCESS"', () => {
    expect(getRenewalPackageStatus('SUCCESS')).toEqual('');
  });
});

describe('getLeadIdFromPath function', () => {
  it('should return the leadID', () => {
    Object.defineProperty(window, 'location', {
      get() {
        return {
          href: 'https://localhost:3030/leads/1a107226-6f37-4ceb-94bc-a352b89c063b',
        };
      },
    });

    expect(getLeadIdFromPath()).toEqual('1a107226-6f37-4ceb-94bc-a352b89c063b');
  });

  it('should return an empty string', () => {
    Object.defineProperty(window, 'location', {
      get() {
        return {
          href: 'https://localhost:3030/leads/',
        };
      },
    });

    expect(getLeadIdFromPath()).toEqual('');
  });

  it('should return an empty string if href is empty', () => {
    Object.defineProperty(window, 'location', {
      get() {
        return {
          href: '',
        };
      },
    });

    expect(getLeadIdFromPath()).toEqual('');
  });
});

describe('getLeadIdFromLeadName function', () => {
  it('should return the leadID', () => {
    expect(
      getLeadIdFromLeadName('leads/1a107226-6f37-4ceb-94bc-a352b89c063b')
    ).toEqual('1a107226-6f37-4ceb-94bc-a352b89c063b');
  });

  it('should return an empty string if the name does not start with leads/', () => {
    expect(getLeadIdFromLeadName('invalid-path/')).toEqual('');
  });

  it('should return an empty string if href is empty', () => {
    expect(getLeadIdFromLeadName('leads/')).toEqual('');
  });
});
describe('getYesNoOptions', () => {
  it('Should return genericOption.yes when option passed is true', () => {
    expect(getYesNoOptions(true)).toEqual('genericOption.yes');
  });

  it('Should return genericOption.nowhen option passed is false', () => {
    expect(getYesNoOptions(false)).toEqual('genericOption.no');
  });
});

describe('leadTypeText function', () => {
  it('should return the leadTypeFilter.new', () => {
    expect(leadTypeText('LEAD_TYPE_NEW')).toEqual('leadTypeFilter.new');
  });
  it('should return the leadTypeFilter.retainer', () => {
    expect(leadTypeText('LEAD_TYPE_RETAINER')).toEqual(
      'leadTypeFilter.retainer'
    );
  });
  it('should return the leadTypeFilter.renewal', () => {
    expect(leadTypeText('LEAD_TYPE_RENEWAL')).toEqual('leadTypeFilter.renewal');
  });
});

describe('Testing new date-fns date fomatter', () => {
  const { DDMMYYYY } = NewDateFormatters();
  const date = '2023-03-31T23:59:59Z';
  it('should format the date in utc with DDMMYYYY format ', () => {
    expect(DDMMYYYY(date)).toBe('31/03/2023');
  });
});

describe('formatDDMMYYYY', () => {
  it('should return the date dd/MM/yyyy format ', () => {
    const date = '2023-03-31T00:00:00Z';
    expect(formatDDMMYYYY(date)).toBe('31/03/2023');
  });

  it('should return the date in utc with DDMMYYYY format', () => {
    const date = '2023-03-31T22:00:00Z';
    expect(formatDDMMYYYY(date)).toBe('01/04/2023');
  });
});

describe('formatDDMMYYYYHHMMSS', () => {
  it('should return the date dd/MM/yyyy format ', () => {
    const date = '2023-03-31T00:00:00Z';
    expect(formatDDMMYYYYHHMMSS(date)).toBe('31/03/2023 (07:00:00 AM)');
  });

  it('should return the date in utc with DDMMYYYY format', () => {
    const date = '2023-03-31T22:00:00Z';
    expect(formatDDMMYYYYHHMMSS(date)).toBe('01/04/2023 (05:00:00 AM)');
  });
});

describe('formatDDMMYYYYHHMMSSUTC', () => {
  it('should return the date dd/MM/yyyy format ', () => {
    const date = '2023-03-31T00:00:00Z';
    expect(formatDDMMYYYYHHMMSSUTC(date)).toBe('31/03/2023 (12:00:00 AM)');
  });

  it('should return the date in utc with DDMMYYYY format', () => {
    const date = '2023-03-31T22:00:00Z';
    expect(formatDDMMYYYYHHMMSSUTC(date)).toBe('31/03/2023 (10:00:00 PM)');
  });
});

describe('maskPhoneNumber', () => {
  it('should return masked phone number ', () => {
    expect(maskPhoneNumber('12')).toBe('12');
  });

  it('should return masked phone number ', () => {
    expect(maskPhoneNumber('01234')).toBe('0****');
  });

  it('should return the phone number', () => {
    expect(maskPhoneNumber('0999999999')).toBe('099999****');
  });
});

describe('maskEmailAddress', () => {
  it('should return masked email address ', () => {
    expect(maskEmailAddress('helloworld@gmail.com')).toBe(
      'he********@gmail.com'
    );
  });

  it('should return the email address passed if length of email is less than 2 characters', () => {
    expect(maskEmailAddress('ab@gmail.com')).toBe('ab@gmail.com');
  });
});

describe('formatCurrency', () => {
  it('should format positive numbers with comma separators', () => {
    expect(formatCurrency(1000)).toBe('1,000');
    expect(formatCurrency(1234567)).toBe('1,234,567');
    expect(formatCurrency(999)).toBe('999');
  });

  it('should format negative numbers with comma separators', () => {
    expect(formatCurrency(-1000)).toBe('-1,000');
    expect(formatCurrency(-1234567)).toBe('-1,234,567');
  });

  it('should format decimal numbers', () => {
    expect(formatCurrency(1000.5)).toBe('1,000.5');
    expect(formatCurrency(1234.56)).toBe('1,234.56');
  });

  it('should format zero', () => {
    expect(formatCurrency(0)).toBe('0');
  });
});

describe('formatDate', () => {
  it('should format date in dd/MM/yyyy format', () => {
    const date = new Date('2023-03-31');
    expect(formatDate(date)).toBe('31/03/2023');
  });

  it('should format date with single digit day and month', () => {
    const date = new Date('2023-01-05');
    expect(formatDate(date)).toBe('05/01/2023');
  });

  it('should format date with different years', () => {
    const date = new Date('2020-12-25');
    expect(formatDate(date)).toBe('25/12/2020');
  });

  it('should handle leap year dates', () => {
    const date = new Date('2024-02-29');
    expect(formatDate(date)).toBe('29/02/2024');
  });
});
