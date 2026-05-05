import { handleFormatDate, formatFilterURI } from './helper';

describe('Testing Helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
  });
  it('should format the url based on data', () => {
    const formattedURI = formatFilterURI({
      search: { key: 'code', value: 'abc' },
      date: {
        startDate: {
          criteria: 'startDate',
          range: { startDate: null, endDate: new Date('2020-01-01') },
        },
        endDate: {
          criteria: 'endDate',
          range: { startDate: new Date('2020-01-01'), endDate: null },
        },
      },
      voucherType: 'cash',
      price: 12,
    });

    expect(formattedURI).toBe(
      'code="abc" startDate="startDate>="1970-01-01T00:00:00Z" startDate<="2020-01-01T23:59:59Z"" endDate="endDate>="2020-01-01T00:00:00Z" endDate<="1970-01-01T23:59:59Z"" voucherType="cash" price=1200'
    );
  });
  it('should format the url based on data', () => {
    const formattedURI = formatFilterURI({
      search: { key: 'code', value: 'abc' },
      date: {
        startDate: {
          criteria: 'startDate',
          range: { startDate: null, endDate: '2020-01-01' },
        },
        endDate: {
          criteria: 'endDate',
          range: { startDate: '2020-01-01', endDate: null },
        },
      },
      voucherType: 'percent',
      percentDiscount: 12,
    });

    expect(formattedURI).toBe(
      'code="abc" startDate="startDate>="1970-01-01T00:00:00Z" startDate<="2020-01-01T23:59:59Z"" endDate="endDate>="2020-01-01T00:00:00Z" endDate<="1970-01-01T23:59:59Z"" voucherType="percent" percentDiscount=1200'
    );
  });
  it('should format the date to utc format', () => {
    const date = handleFormatDate('2020-12-22');
    expect(date).toBe('2020-12-22T23:59:59Z');
  });
});
