const isCanCreateLead = (useRole: string) => {
  const rolesCreateLead = [
    'roles/admin',
    'roles/super-admin',
    'roles/backoffice-supervisor',
  ];
  return rolesCreateLead.includes(useRole);
};

const canDownload = (userRole: string) => {
  const rolesCreateLead = [
    'roles/admin',
    'roles/super-admin',
    'roles/backoffice-supervisor',
  ];
  return rolesCreateLead.includes(userRole);
};

const healthLeadImportColumns = [
  'First Name',
  'Last Name',
  'Gender',
  'Date of birth',
  'Phone',
  'Email',
  'Policy Start date',
  'First Name (Policy holder)',
  'Last Name (Policy holder)',
  'Date of birth (Policy holder)',
  'ID Card (Policy holder)',
  'Passport (Policy holder)',
  'Occupation (Policy holder)',
  'Race (Policy holder)',
  'Policy holder Type',
  'Language',
  'Title (Beneficiary)',
  'First Name (Beneficiary)',
  'Last Name (Beneficiary)',
  'Gender (Beneficiary)',
  'Relationship (Beneficiary)',
  'Phone (Beneficiary)',
  'Email (Beneficiary)',
  'Sales Agent',
  'Remark',
  'Reference ID',
  'Category',
  'Sub Category',
];

const healthLeadImportColumnsWithType = [
  { name: 'First Name', dataType: 'string' },
  { name: 'Last Name', dataType: 'string' },
  { name: 'Gender', dataType: 'gender' },
  { name: 'Date of birth', dataType: 'date' },
  { name: 'Phone', dataType: 'number' },
  { name: 'Email', dataType: 'email' },
  { name: 'Policy Start date', dataType: 'date' },
  { name: 'First Name (Policy holder)', dataType: 'string' },
  { name: 'Last Name (Policy holder)', dataType: 'string' },
  { name: 'Date of birth (Policy holder)', dataType: 'date' },
  { name: 'ID Card (Policy holder)', dataType: 'number' },
  { name: 'Passport (Policy holder)', dataType: 'string' },
  { name: 'Occupation (Policy holder)', dataType: 'string' },
  { name: 'Race (Policy holder)', dataType: 'string' },
  { name: 'Policy holder Type', dataType: 'string' },
  { name: 'Language', dataType: 'string' },
  { name: 'Title (Beneficiary)', dataType: 'string' },
  { name: 'First Name (Beneficiary)', dataType: 'string' },
  { name: 'Last Name (Beneficiary)', dataType: 'string' },
  { name: 'Gender (Beneficiary)', dataType: 'gender' },
  { name: 'Relationship (Beneficiary)', dataType: 'string' },
  { name: 'Phone (Beneficiary)', dataType: 'number' },
  { name: 'Email (Beneficiary)', dataType: 'email' },
  { name: 'Sales Agent', dataType: 'string' },
  { name: 'Remark', dataType: 'string' },
  { name: 'Reference ID', dataType: 'string' },
  { name: 'Category', dataType: 'string' },
  { name: 'Sub Category', dataType: 'string' },
];

const healthLeadImportRequiredColumns = ['First Name', 'Last Name', 'Phone'];
const healthLeadImportShouldNotHaveColumns = ['Redbook ID'];

const healthLeadImportMaximumLimit = 10000;

export {
  isCanCreateLead,
  canDownload,
  healthLeadImportColumns,
  healthLeadImportColumnsWithType,
  healthLeadImportRequiredColumns,
  healthLeadImportShouldNotHaveColumns,
  healthLeadImportMaximumLimit,
};
