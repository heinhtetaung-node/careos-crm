export const defaultData = {
  customerFirstName: 'John',
  customerLastName: 'Doe',
  customerDOB: '1990-01-01',
  policyTitle: 'Mr',
};

export const policyHolderTypeChangeTestCases: [string, any, any][] = [
  [
    'customer',
    defaultData,
    {
      policyHolderType: 'customer',
      policyHolderFirstName: 'John',
      policyHolderLastName: 'Doe',
      policyHolderDOB: '1990-01-01',
      policyTitle: 'Mr',
    },
  ],
  [
    'company',
    defaultData,
    {
      policyHolderType: 'company',
      policyHolderCompanyName: '',
      policyHolderTaxId: '',
    },
  ],
  [
    'unknown',
    defaultData,
    {
      policyHolderType: 'unknown',
      policyHolderFirstName: '',
      policyHolderLastName: '',
      policyHolderDOB: '',
      policyTitle: '',
    },
  ],
  [
    'customer',
    {
      customerFirstName: undefined,
      customerLastName: null,
      customerDOB: '',
      policyTitle: undefined,
    },
    {
      policyHolderType: 'customer',
      policyHolderFirstName: undefined,
      policyHolderLastName: null,
      policyHolderDOB: '',
      policyTitle: undefined,
    },
  ],
  [
    'company',
    {},
    {
      policyHolderType: 'company',
      policyHolderCompanyName: '',
      policyHolderTaxId: '',
    },
  ],
];

export const defaultCaseTestCases: [string, any, any][] = [
  ['customerFirstName', 'John', 'John'],
  ['customerFirstName', { value: 'John', label: 'John' }, 'John'],
  ['customerFirstName', null, null],
  ['customerFirstName', undefined, undefined],
  ['customerFirstName', '', ''],
  ['numberOfFixedDriver', 0, 0],
  ['isActive', true, true],
];

export const policyTitleArrayValue = [
  { value: 'Mr', label: 'Mr.' },
  { label: 'Dr.' },
  { value: 'Prof', label: 'Professor' },
];

export const policyTitleSingleValue = { value: 'Mr', label: 'Mr.' };

export const policyTitleValueWithoutValueProp = { label: 'Mr.' };

export const policyTitleExpectedArrayResult = ['Mr', { label: 'Dr.' }, 'Prof'];
