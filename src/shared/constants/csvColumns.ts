const csvColumns = [
  'First Name',
  'Last Name',
  'Gender',
  'Date of birth',
  'Phone',
  'Email',
  'Redbook ID',
  'Policy Start date',
  'Chassis number',
  'Current insurer',
  'Remark',
];

export const csvColumnsWithType = [
  { name: 'First Name', dataType: 'string' },
  { name: 'Last Name', dataType: 'string' },
  { name: 'Gender', dataType: 'gender' },
  { name: 'Date of birth', dataType: 'date' },
  { name: 'Phone', dataType: 'number' },
  { name: 'Email', dataType: 'email' },
  { name: 'Redbook ID', dataType: 'string' },
  { name: 'Policy Start date', dataType: 'date' },
  { name: 'Chassis number', dataType: 'chassisNumber' },
  { name: 'Current insurer', dataType: 'currentInsurer' },
  { name: 'Remark', dataType: 'remark' },
];

export default csvColumns;
