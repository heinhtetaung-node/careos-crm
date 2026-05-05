import {
  changeSortStatus,
  getOrderLead,
  returnTableAllLeadSetting,
  SORT_TABLE_TYPE,
} from 'presentation/components/TableAllLead/TableAllLead.helper';
import { leadRejectionColumns } from 'presentation/components/TableAllLead/TableRejectionLead.helper';

test('Check table setting for LEAD_REJECTION', () => {
  expect(returnTableAllLeadSetting('LEAD_REJECTION')).toEqual(
    leadRejectionColumns
  );
});

test('Check table setting for LEAD_ALL when feature flags is off', () => {
  const returnSetting = returnTableAllLeadSetting('LEAD_ALL');
  expect(returnSetting.length).toBe(32);
  expect(returnSetting.filter((x) => x.isNotSorting).length).toBe(22);
});

test('Check table setting for LEAD_ALL when feature flags is on', () => {
  const returnSetting = returnTableAllLeadSetting('LEAD_ALL');
  expect(returnSetting.length).toBe(32);
  expect(returnSetting.filter((x) => x.isNotSorting).length).toBe(22);
});

test('Check table setting for LEAD_ASSIGNMENT when feature flags is off', () => {
  const tableSetting = returnTableAllLeadSetting('LEAD_ASSIGNMENT');
  expect(tableSetting.length).toBe(28);
  expect(tableSetting.filter((x) => x.isNotSorting).length).toBe(20);
});

test('Check table setting for LEAD_ASSIGNMENT when feature flags is on', () => {
  const tableSetting = returnTableAllLeadSetting('LEAD_ASSIGNMENT');
  expect(tableSetting.length).toBe(28);
  expect(tableSetting.filter((x) => x.isNotSorting).length).toBe(20);
});

test('Check change status from none to asc', () => {
  expect(changeSortStatus(SORT_TABLE_TYPE.NONE)).toEqual(SORT_TABLE_TYPE.ASC);
});

test('Check change status from asc to desc', () => {
  expect(changeSortStatus(SORT_TABLE_TYPE.ASC)).toEqual(SORT_TABLE_TYPE.DESC);
});

test('Check change status from desc to none', () => {
  expect(changeSortStatus(SORT_TABLE_TYPE.DESC)).toEqual(SORT_TABLE_TYPE.NONE);
});

test('Check order by string with field is empty string', () => {
  expect(getOrderLead('')).toEqual('');
});

test('Check order by string', () => {
  expect(getOrderLead('lead.type')).toEqual('order_by=lead.type desc');
});

test('Check order by string with field is empty string and order by asc', () => {
  expect(getOrderLead('', SORT_TABLE_TYPE.ASC)).toEqual('');
});

test('Check order by string with order by none', () => {
  expect(getOrderLead('lead.type', SORT_TABLE_TYPE.NONE)).toEqual('');
});

test('Check order by string with order by asc', () => {
  expect(getOrderLead('lead.type', SORT_TABLE_TYPE.ASC)).toEqual(
    'order_by=lead.type'
  );
});

test('Check order by string with order by desc', () => {
  expect(getOrderLead('lead.type', SORT_TABLE_TYPE.DESC)).toEqual(
    'order_by=lead.type desc'
  );
});
