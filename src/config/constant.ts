export const MINUTE_PER_SLOT = 3;

export const MINUTES_PER_HOUR = 60;

export const PACKAGE_IMPORT_MAX_ROWS = 500;

export enum UserRoles {
  SUPER_ADMIN_ROLE = 'roles/super-admin',
  ADMIN_ROLE = 'roles/admin',
  SALE_ROLE = 'roles/sales',
  MANAGER_ROLE = 'roles/manager',
  SUPERVISOR_ROLE = 'roles/supervisor',
  INBOUND_ROLE = 'roles/inbound',
  DOCUMENT_COLLECTIONS = 'roles/documents-collection',
  QUALITY_CONTROL = 'roles/quality-control',
  PROBLEM_CASE = 'roles/problem-case',
  SHIPMENT = 'roles/shipment-agent',
  ACCOUNTING = 'roles/accounting',
  CUSTOMER_SERVICE = 'roles/customer-service',
  SUBMISSION = 'roles/submission',
  BACK_OFFICE = 'roles/backoffice-supervisor',
  CI_AGENT = 'roles/cash-installment-agent',
  CI_SUPERVISOR = 'roles/cash-installment-supervisor',
}

export const assignAbleUser = [
  'roles/super-admin',
  'roles/admin',
  'roles/supervisor',
  'roles/manager',
];

export const importAbleUser = [
  'roles/super-admin',
  'roles/admin',
  'roles/backoffice-supervisor',
];

export const rejectAbleUser = [
  'roles/super-admin',
  'roles/admin',
  'roles/backoffice-supervisor',
  'roles/supervisor',
  'roles/manager',
];

export const discountAbleUser = [
  'roles/super-admin',
  'roles/admin',
  'roles/supervisor',
  'roles/manager',
];

export const exportAbleUser = [
  'roles/super-admin',
  'roles/admin',
  'roles/backoffice-supervisor',
];

export const underwritingAbleUser = [
  'roles/super-admin',
  'roles/admin',
  'roles/backoffice-supervisor',
];

export const appointmentAbleUser = [
  'roles/super-admin',
  'roles/admin',
  'roles/supervisor',
  'roles/manager',
  'roles/sales',
];

export const ECT_SOURCE_IDS = [
  'sources/ac666bff-ec89-423e-a55d-9d0534f33b63',
  'sources/6a81eae5-929b-479b-a8aa-8a1ff0fc7fa7',
];

export const NANA_SOURCE_IDS = [
  'sources/ade2e4bb-23dd-4fa8-bd06-9e0b83df3fad',
  'sources/6a6d72ea-2558-4cae-848d-9e020d55ae39',
];

export const ADB_SOURCE_IDS = [
  'sources/4d3d97c0-d65a-4a9f-a660-c11b533e186e',
  'sources/287cf90d-f15c-4f1d-94ee-e6f10f2be0a0',
];

export const FOREIGN_LEADS_SOURCES = [
  ...ECT_SOURCE_IDS,
  ...NANA_SOURCE_IDS,
  ...ADB_SOURCE_IDS,
];

export const MB_PER_BYTES = 1048576;

export const NO_USER_ID = 'users/00000000-0000-0000-0000-000000000000';

const baseUrl = process.env.VITE_API_ENDPOINT || '';
export const KNOWLEDGEBASE_URL = `${baseUrl}/knowledgebase/`;

export const { mode } = process.env;
export const INSURER_LOGO_BASE_URL =
  'https://storage.googleapis.com/skillful-rush';

export const LIMIT_FOR_FETCH_MORE = 10;
export const LIMIT_FOR_INITIAL_FETCH = 50;
