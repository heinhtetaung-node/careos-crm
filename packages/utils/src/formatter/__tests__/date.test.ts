import {
  formatDateToOrdinal,
  getMaxDaysByMonthDigits,
  getValidDate,
  getValidMonth,
  formatDateInput,
} from '../date';

describe('formatDateToOrdinal', () => {
  it('should return the date in words for string input', () => {
    expect(formatDateToOrdinal('12/12/2022')).toBe('12th December 2022');
  });

  it('should return the date in words for Date object input', () => {
    expect(formatDateToOrdinal(new Date(2022, 11, 12))).toBe(
      '12th December 2022'
    );
  });

  it('should format 1st, 2nd, 3rd ordinals correctly', () => {
    expect(formatDateToOrdinal(new Date(2023, 0, 1))).toBe('1st January 2023');
    expect(formatDateToOrdinal(new Date(2023, 0, 2))).toBe('2nd January 2023');
    expect(formatDateToOrdinal(new Date(2023, 0, 3))).toBe('3rd January 2023');
  });

  it('should format 21st, 22nd, 23rd ordinals correctly', () => {
    expect(formatDateToOrdinal(new Date(2023, 0, 21))).toBe(
      '21st January 2023'
    );
    expect(formatDateToOrdinal(new Date(2023, 0, 22))).toBe(
      '22nd January 2023'
    );
    expect(formatDateToOrdinal(new Date(2023, 0, 23))).toBe(
      '23rd January 2023'
    );
  });

  it('should format 31st correctly', () => {
    expect(formatDateToOrdinal(new Date(2023, 11, 31))).toBe(
      '31st December 2023'
    );
  });
});

describe('getMaxDaysByMonthDigits', () => {
  it('should return 31 for months 1, 3, 5, 7, 8, 10, 12', () => {
    expect(getMaxDaysByMonthDigits(1)).toBe(31);
    expect(getMaxDaysByMonthDigits(3)).toBe(31);
    expect(getMaxDaysByMonthDigits(5)).toBe(31);
    expect(getMaxDaysByMonthDigits(7)).toBe(31);
    expect(getMaxDaysByMonthDigits(8)).toBe(31);
    expect(getMaxDaysByMonthDigits(10)).toBe(31);
    expect(getMaxDaysByMonthDigits(12)).toBe(31);
  });

  it('should return 30 for months 4, 6, 9, 11', () => {
    expect(getMaxDaysByMonthDigits(4)).toBe(30);
    expect(getMaxDaysByMonthDigits(6)).toBe(30);
    expect(getMaxDaysByMonthDigits(9)).toBe(30);
    expect(getMaxDaysByMonthDigits(11)).toBe(30);
  });

  it('should return 29 for month 2', () => {
    expect(getMaxDaysByMonthDigits(2)).toBe(29);
  });
});

describe('getValidMonth', () => {
  it('should convert 00 to 01', () => {
    expect(getValidMonth('00')).toBe('01');
  });

  it('should prefix single digit > 1 with zero', () => {
    expect(getValidMonth('3')).toBe('03');
    expect(getValidMonth('9')).toBe('09');
  });

  it('should cap month at 12 when over 12', () => {
    expect(getValidMonth('13')).toBe('12');
  });

  it('should return valid months unchanged', () => {
    expect(getValidMonth('01')).toBe('01');
    expect(getValidMonth('06')).toBe('06');
    expect(getValidMonth('12')).toBe('12');
  });
});

describe('getValidDate', () => {
  it('should convert 00 to 01', () => {
    expect(getValidDate('00', '01012023')).toBe('01');
  });

  it('should prefix single digit > 3 with zero', () => {
    expect(getValidDate('5', '01012023')).toBe('05');
    expect(getValidDate('9', '01012023')).toBe('09');
  });

  it('should cap day at maxDays when over (31-day month)', () => {
    expect(getValidDate('32', '01012023')).toBe('31');
  });

  it('should cap day at 30 for 30-day months', () => {
    // value format is DDMMYYYY, so 31042023 = 31st April 2023
    expect(getValidDate('31', '31042023')).toBe('30'); // April
    expect(getValidDate('31', '31062023')).toBe('30'); // June
  });

  it('should cap day at 28/29 for February using getDaysInMonth', () => {
    // value format is DDMMYYYY
    expect(getValidDate('30', '15022023')).toBe('28'); // Feb 2023 non-leap
    expect(getValidDate('30', '15022024')).toBe('29'); // Feb 2024 leap year
  });

  it('should return valid days unchanged', () => {
    expect(getValidDate('15', '15062023')).toBe('15');
    expect(getValidDate('01', '01012023')).toBe('01');
  });
});

describe('formatDateInput', () => {
  it('should return empty string for empty input', () => {
    expect(formatDateInput('')).toBe('');
  });

  it('should strip non-numeric characters', () => {
    expect(formatDateInput('12a01b2023')).toBe('12/01/2023');
    expect(formatDateInput('01-02-2023')).toBe('01/02/2023');
  });

  it('should format single digit day without slash', () => {
    expect(formatDateInput('1')).toBe('1');
  });

  it('should add first slash after two day digits', () => {
    expect(formatDateInput('12')).toBe('12/');
  });

  it('should format day and month with second slash after 4 digits', () => {
    expect(formatDateInput('120')).toBe('12/0');
    expect(formatDateInput('1201')).toBe('12/01/');
  });

  it('should format full date and slice to 10 chars', () => {
    expect(formatDateInput('12012023')).toBe('12/01/2023');
    expect(formatDateInput('31122023')).toBe('31/12/2023');
  });

  it('should clamp invalid day 00 to 01', () => {
    expect(formatDateInput('00')).toBe('01/');
  });

  it('should clamp invalid day 32 to 31 for January', () => {
    expect(formatDateInput('32012023')).toBe('31/01/2023');
  });

  it('should clamp invalid month 00 to 01', () => {
    expect(formatDateInput('15002023')).toBe('15/01/2023');
  });

  it('should clamp invalid month 13 to 12', () => {
    expect(formatDateInput('15132023')).toBe('15/12/2023');
  });
});
