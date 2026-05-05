import { utcToZonedTime } from 'date-fns-tz';

import TABLE_LEAD_TYPE from 'presentation/pages/car-insurance/leads/LeadDashBoard/LeadDashBoard.helper';
import { SORT_TABLE_TYPE } from 'shared/helper/utilities';

import {
  getLeadSearchFilterQueryString,
  getSortQueryString,
  transformPageStateToQuery,
} from './leadSearchUtils';

jest.useFakeTimers().setSystemTime(new Date('2023-02-16'));

jest.mock('flagsmith', () => ({
  ...jest.requireActual('flagsmith'),
  getAllFlags: jest.fn().mockReturnValue({}),
}));

describe('getSortQueryString', () => {
  test('should return valid sort string for sort(none)', () => {
    const result = getSortQueryString('fieldName', SORT_TABLE_TYPE.NONE);
    expect(result).toBe('');
  });
  test('should return valid sort string for sort(desc)', () => {
    const result = getSortQueryString('fieldName', SORT_TABLE_TYPE.DESC);
    expect(result).toBe('fieldName desc');
  });
  test('should return valid for string sort(asc)', () => {
    const result = getSortQueryString('fieldName', SORT_TABLE_TYPE.ASC);
    expect(result).toBe('fieldName');
  });
  test('default case', () => {
    const result = getSortQueryString('fieldName', '' as SORT_TABLE_TYPE);
    expect(result).toBe('');
  });
});

describe('transformPageStateToQuery', () => {
  test('should exclude if current page is 1', () => {
    const result = transformPageStateToQuery({
      currentPage: 1,
      pageSize: 15,
      orderBy: '',
    });
    expect(result).toStrictEqual({
      page_size: 15,
      order_by: '',
    });
  });
  test('should calculate the page_from query based on current page', () => {
    const result = transformPageStateToQuery({
      currentPage: 2,
      pageSize: 15,
      orderBy: '',
    });
    expect(result).toStrictEqual({
      page_from: 15,
      page_size: 15,
      order_by: '',
    });
  });
});

describe('getLeadSearchQueryStirng', () => {
  test('for assignment table type, default', () => {
    const result = getLeadSearchFilterQueryString({
      tableType: TABLE_LEAD_TYPE.LEAD_ASSIGNMENT,
      filters: [],
      policyDateEnabled: false,
    });
    expect(result).toBe(
      'lead.status!="LEAD_STATUS_PURCHASED" lead.isRejected!=true'
    );
  });

  test('for assignment table type, lead status search should overwrite default value if present in filter', () => {
    const result = getLeadSearchFilterQueryString({
      tableType: TABLE_LEAD_TYPE.LEAD_ASSIGNMENT,
      filters: {
        leadStatus: [{ id: 1, title: 'New', value: 'LEAD_STATUS_NEW' }],
      },
      policyDateEnabled: false,
    });
    expect(result).toBe(
      'lead.status in ("LEAD_STATUS_NEW") lead.isRejected!=true'
    );
  });

  test('for assignment table, if policyExpiry is enabld, it should included in query string', () => {
    const result = getLeadSearchFilterQueryString({
      tableType: TABLE_LEAD_TYPE.LEAD_ASSIGNMENT,
      filters: {},
      policyDateEnabled: true,
    });
    expect(result).toBe(
      'lead.status!="LEAD_STATUS_PURCHASED" insurance.policyExpiryDate<="2023-05-17" insurance.policyExpiryDate>="0001-01-01T00:00:00Z" lead.isRejected!=true'
    );
  });

  test('for rejection, default', () => {
    const result = getLeadSearchFilterQueryString({
      tableType: TABLE_LEAD_TYPE.LEAD_REJECTION,
      filters: {},
      policyDateEnabled: false,
    });
    expect(result).toBe(
      'lead.isRejected=false rejections.decideTime="0001-01-01T00:00:00Z"'
    );
  });

  test('for lead all, default', () => {
    const result = getLeadSearchFilterQueryString({
      tableType: TABLE_LEAD_TYPE.LEAD_ALL,
      filters: {},
      policyDateEnabled: false,
    });
    expect(result).toBe('');
  });

  test('for lead all, policyExpiry should be included in query string if policyExpiry is enabled', () => {
    const result = getLeadSearchFilterQueryString({
      tableType: TABLE_LEAD_TYPE.LEAD_ALL,
      filters: {},
      policyDateEnabled: true,
    });
    expect(result).toBe(
      'insurance.policyExpiryDate<="2023-05-17" insurance.policyExpiryDate>="0001-01-01T00:00:00Z"'
    );
  });

  test('for myLead, default', () => {
    const result = getLeadSearchFilterQueryString({
      tableType: TABLE_LEAD_TYPE.LEAD_MYLEAD,
      filters: {},
      policyDateEnabled: true,
    });
    expect(result).toBe('lead.isRejected!=true');
  });

  test('myLead page with appointed date filter', () => {
    const result = getLeadSearchFilterQueryString({
      tableType: TABLE_LEAD_TYPE.LEAD_MYLEAD,
      filters: {
        date: {
          startDate: {
            criteria: 'appointmentTime',
            range: {
              startDate: utcToZonedTime(new Date('2023-01-27'), 'UTC'),
              endDate: utcToZonedTime(new Date('2023-02-06'), 'UTC'),
            },
          },
        },
      },
      policyDateEnabled: true,
    });
    expect(result).toBe(
      'appointments[].startTime>="2023-01-26T17:00:00.000Z" appointments[].startTime<="2023-02-05T17:00:00.000Z" lead.isRejected!=true'
    );
  });
});
