import {
  getRowMissing,
  pushErrorMissingColumn,
} from '../../../presentation/modules/importUser/importUser.helper';
import { getString } from '../../../presentation/theme/localization';

const ROWS_MISSING = [5, 8];
const TYPE_MISSING = 3;
const CSV_COLUMN = [
  {
    'User Role': 'Lead',
    'First Name': 'John',
    'Last Name': 'Carl',
    'User Name': 'josn_123',
    'Assigned Product': '1',
    'Assigned Team': '',
    'Daily Lead Limit': '',
    'Total Lead Limit': '30',
    'Agent Score': '',
    'User Status': '9',
  },
  {
    'User Role': 'Lead',
    'First Name': 'John',
    'Last Name': 'Carl',
    'User Name': 'josn_123',
    'Assigned Product': '1',
    'Assigned Team': '',
    'Daily Lead Limit': '20',
    'Total Lead Limit': '30',
    'Agent Score': '5',
    'User Status': '9',
  },
  {
    'User Role': 'Admin',
    'First Name': 'John',
    'Last Name': 'Carl',
    'User Name': 'josn_123',
    'Assigned Product': '1',
    'Assigned Team': '2',
    'Daily Lead Limit': '20',
    'Total Lead Limit': '30',
    'Agent Score': '5',
    'User Status': '9',
  },
  {
    'User Role': 'Admin',
    'First Name': 'John',
    'Last Name': 'Carl',
    'User Name': 'josn_123',
    'Assigned Product': '1',
    'Assigned Team': '2',
    'Daily Lead Limit': '20',
    'Total Lead Limit': '30',
    'Agent Score': '5',
    'User Status': '9',
  },
  {
    'User Role': 'Sales Agent',
    'First Name': 'John',
    'Last Name': 'Carl',
    'User Name': 'josn_123',
    'Assigned Product': '1',
    'Assigned Team': '2',
    'Daily Lead Limit': '3',
    'Total Lead Limit': '30',
    'Agent Score': '',
    'User Status': '9',
  },
  {
    'User Role': 'Admin',
    'First Name': 'John',
    'Last Name': 'Carl',
    'User Name': 'josn_123',
    'Assigned Product': '1',
    'Assigned Team': '2',
    'Daily Lead Limit': '20',
    'Total Lead Limit': '30',
    'Agent Score': '5',
    'User Status': '9',
  },
  {
    'User Role': 'Admin',
    'First Name': 'John',
    'Last Name': 'Carl',
    'User Name': 'josn_123',
    'Assigned Product': '1',
    'Assigned Team': '2',
    'Daily Lead Limit': '20',
    'Total Lead Limit': '30',
    'Agent Score': '5',
    'User Status': '9',
  },
  {
    'User Role': 'Sales Agent',
    'First Name': 'John',
    'Last Name': 'Carl',
    'User Name': 'josn_123',
    'Assigned Product': '1',
    'Assigned Team': '2',
    'Daily Lead Limit': '20',
    'Total Lead Limit': '30',
    'Agent Score': '',
    'User Status': '9',
  },
  {
    'User Role': 'Admin',
    'First Name': 'John',
    'Last Name': 'Carl',
    'User Name': 'josn_123',
    'Assigned Product': '1',
    'Assigned Team': '2',
    'Daily Lead Limit': '20',
    'Total Lead Limit': '30',
    'Agent Score': '5',
    'User Status': '9',
  },
];
const getEqualList = () => {
  return ROWS_MISSING.map(() => getString('text.requiredRowsValidation'));
};
test('Content row missing', () => {
  expect(pushErrorMissingColumn(ROWS_MISSING, TYPE_MISSING)).toEqual(
    getEqualList()
  );
});
const rowMissingOutput = {
  missTeam: [],
  missDaily: [],
  missTotal: [],
  missScore: [5, 8],
  hasTeam: [3, 4, 6, 7, 9],
  hasDaily: [2, 3, 4, 6, 7, 9],
  hasTotal: [1, 2, 3, 4, 6, 7, 9],
  hasScore: [2, 3, 4, 6, 7, 9],
  hasRoleInvalid: [
    { index: 1, value: 'lead' },
    { index: 2, value: 'lead' },
  ],
  hasStatusInvalid: [
    { index: 1, value: '9' },
    { index: 2, value: '9' },
    { index: 3, value: '9' },
    { index: 4, value: '9' },
    { index: 5, value: '9' },
    { index: 6, value: '9' },
    { index: 7, value: '9' },
    { index: 8, value: '9' },
    { index: 9, value: '9' },
  ],
};
test('Get row missing', () => {
  expect(JSON.stringify(getRowMissing(CSV_COLUMN))).toEqual(
    JSON.stringify(rowMissingOutput)
  );
});
