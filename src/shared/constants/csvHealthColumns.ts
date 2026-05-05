const csvHealthColumns = [
  'First Name',
  'Last Name',
  'Gender',
  'Date of birth',
  'Phone',
  'Email',
  'Policy Start date',
];

export const csvHealthColumnsWithType = [
  { name: 'First Name', dataType: 'string' },
  { name: 'Last Name', dataType: 'string' },
  { name: 'Gender', dataType: 'gender' },
  { name: 'Date of birth', dataType: 'date' },
  { name: 'Phone', dataType: 'number' },
  { name: 'Email', dataType: 'email' },
  { name: 'Policy Start date', dataType: 'date' },
];

export default csvHealthColumns;
