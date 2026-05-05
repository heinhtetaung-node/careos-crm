const isCanCreateLead = (useRole: string) => {
  const rolesCreateLead = ['roles/admin', 'roles/super-admin'];
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

const leadImportColumns = [
  'First Name',
  'Last Name',
  'Gender',
  'Date of birth',
  'Phone',
  'Email',
  'Redbook ID',
  'Policy Start date',
  'Remark',
];

const leadImportColumnsWithType = [
  { name: 'First Name', dataType: 'string' },
  { name: 'Last Name', dataType: 'string' },
  { name: 'Gender', dataType: 'gender' },
  { name: 'Date of birth', dataType: 'date' },
  { name: 'Phone', dataType: 'number' },
  { name: 'Email', dataType: 'email' },
  { name: 'Redbook ID', dataType: 'string' },
  { name: 'Policy Start date', dataType: 'date' },
  { name: 'Remark', dataType: 'string' },
];

const leadImportRequiredColumns = ['First Name', 'Phone'];
const leadImportOptionalColumns = ['Redbook ID'];

const leadImportMaximumLimit = 10000;

export {
  isCanCreateLead,
  canDownload,
  leadImportColumns,
  leadImportColumnsWithType,
  leadImportRequiredColumns,
  leadImportOptionalColumns,
  leadImportMaximumLimit,
};
