import { formatFilterURI } from './helper';

describe('Testing Helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
  });
  it('should format the url based on data', () => {
    const formattedURI = formatFilterURI({
      search: { key: 'description', value: 'abc' },
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
      discountPercentage: [1, 12],
      approver: 'roles/manager',
    });

    expect(formattedURI).toBe(
      'description="abc" startDate>="1970-01-01T00:00:00Z" startDate<="2020-01-01T23:59:59Z" endDate>="2020-01-01T00:00:00Z" endDate<="1970-01-01T23:59:59Z" discountPercentage>=100 discountPercentage<=1200 approver="roles/manager"'
    );
  });
  it('should format the url based on data', () => {
    const formattedURI = formatFilterURI({
      search: { key: 'description', value: 'abc' },
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
      discountPercentage: [],
      approver: 'roles/manager',
    });

    expect(formattedURI).toBe(
      'description="abc" startDate>="1970-01-01T00:00:00Z" startDate<="2020-01-01T23:59:59Z" endDate>="2020-01-01T00:00:00Z" endDate<="1970-01-01T23:59:59Z" approver="roles/manager"'
    );
  });
  it('should format the url based on data', () => {
    const formattedURI = formatFilterURI({
      search: { key: 'description', value: 'abc' },
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
      discountPercentage: [],
      approver: '-',
    });

    expect(formattedURI).toBe(
      'description="abc" startDate>="1970-01-01T00:00:00Z" startDate<="2020-01-01T23:59:59Z" endDate>="2020-01-01T00:00:00Z" endDate<="1970-01-01T23:59:59Z" approver!!TRUE'
    );
  });
});
