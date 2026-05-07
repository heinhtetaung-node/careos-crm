export enum API_METHOD {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export const ATTACHMENT_PAGE_SIZE = 100;
export const INIT_INTERVAL_RETRY_MS = 1000;
export const STATUS_RETRY_API = 500;
export const MAX_RETRIES_API = 4;
export const ActionStatus = {
  NONE: 'none',
  FETCHING: 'fetching',
  REFRESHING: 'refreshing',
  DONE: 'done',
};

export const SearchCriteriaConditionTypes = {
  Equal: 'eq',
  In: 'in',
  GreaterThan: 'gt',
  LessThan: 'lt',
  Between: 'between',
  Finset: 'finset',
  Like: 'like',
};
export const SortDirections = {
  Ascending: 'ASC',
  Descending: 'DESC',
};

export const PageSize = {
  Default: 20,
};

export const Gender = {
  Male: 1,
  Female: 2,
};

export const DateTimeFormat = {
  FullDateTime: 'dd/MM/yyyy hh:mm:ss',
  DateTimeAmPm: 'dd/MM/yyyy hh aa',
  DateTime24h: 'dd/MM/yyyy HH:mm',
  Time: 'hh:mm:ss',
  FullDate: 'dd/MM/yyyy',
  TimeHourMinPM: 'HH:mm aa',
  FullDateDash: 'dd-MM-yyyy',
  APIFormat: 'yyyy-MM-dd HH:mm:ss',
};

export const PriceFormat = {
  Default: '0,0',
};

export const LimitNumber = {
  MaxAddress: 3,
};

export const csvTypeFiles = [
  'application/csv',
  'application/x-csv',
  'text/csv',
  'text/comma-separated-values',
  'text/x-comma-separated-values',
  'text/tab-separated-values',
];

export const dayComponentColors = {
  paymentCalls: 'red',
  urgentCalls: 'red',
  appointmentCalls: 'green',
};

export const snackBarConfig = {
  duration: 5000,
  type: {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
  },
};

export const ModalConfig = {
  userModal: 'user',
  teamModal: 'team',
  adminModal: 'admin',
  leadSourcesModal: 'leadSources',
  leadSummaryCallModal: 'leadSummaryCallModal',
};

export const socketEndpoints = {
  call: 'call/v1alpha1/#',
  leads: 'lead/v1alpha2/#',
};

export const apiEndpoint = {
  userEndpoint: 'user/v1alpha1',
  userEndpoint_v2: 'view/v1alpha1/views/users',
  teamEndpoint: 'team/v1alpha1',
  carEndpoint: 'car/v1alpha1',
  carDetailEndpoint: 'api/cars/years',
  provinceDetailEndpoint: 'address/v1alpha1/provinces',
  viewTeamEndpoint: 'view/v1alpha1/views/teams',
  leadSettingEndpoint: 'assign/v1alpha1',
  leadEndpoint: 'api/lead/v1alpha2',
  leadEndpoint_v2: 'api/view/v1alpha1/views/sources',
  mediumEndpoint: 'api/sources/mediums',
  campaignEndpoint: 'api/sources/campaigns',
  scoreEndpoint: 'api/score/v1alpha1',
  rejectionEndpoint: 'api/reject/v1alpha1',
  saveAppointmentEndpoint: 'api/calendar/v1alpha1',
  deleteAppointmentEndpoint: 'api/calendar/v1alpha1',
  fullLeadSourcesEndpoint: 'api/sources/lookup',
  nestEndpoint: 'api',
  emailEndpoint: 'api/mailer/v1alpha1',
  smsEndpoint: 'api/sms/v1alpha1',
  importLeadEndPoint: 'api/lead/v1alpha2/leads',
  updateLeadEndPoint: 'api/lead/v1alpha2/leads',
  addLeadEndPoint: 'api/lead/v1alpha2/leads',
  provinces: 'api/address/v1alpha1',
  importLeadEndPoint_v2: 'api/lead-import/v1alpha1',
  lookUpUserEndPoint: 'api/users',
  lookupTeamEndPoint: 'api/teams',
  getCar: 'api/car/v1alpha1',
  getPaymentOptions: (lead: string) =>
    `api/leads/${lead}/package/payment-options`,
  call: 'api/call/v1alpha1',
  leadTokenEndpoint: (lead: string) => `api/leads/${lead}/redirect`,
  leadAssignment: 'api/lead-search/v1alpha1/search',
  getOrdersList: 'api/lead-search/v1alpha1/search/orders',
  getOrdersSubmission: 'api/lead-search/v1alpha1/search/orders/-/items',
  assignLeads: 'api/leads/bulk/assign',
  assignLeadWithLog: (lead: string) =>
    `api/assign/v1alpha1/${lead}/assignments`,
  unassignLeadWithLog: (assignment: string) =>
    `api/assign/v1alpha1/${assignment}`,
  rejectLeads: 'api/leads/bulk/rejection',
  transformPlaceholders: (lead: string) =>
    `api/leads/${lead}/transform-placeholders`,
  customQuote: (lead: string) => `api/leads/${lead}/package`,
  myLeads: 'api/lead-search/v1alpha1/search',
  bulkImportant: 'api/leads/bulk/important',
  getLeadPackage: (lead: string) => `api/leads/${lead}/package`,
  createPaySlip: 'api/leads',
  packageImported: 'api/lead-import',
  createByUser: 'api/users/lookup/create-by',
  createByTeam: 'api/teams/lookup/create-by',
  getAssignToUser: 'api/leads/lookup/assigned',
  orderEndpoint: 'api/orders',
  leadImportMain: 'api/lead-import',
  getOrderComments: 'api/orders',
};

export const apiUrl = {
  getTeam: `${apiEndpoint.teamEndpoint}/teams`,
  getUser: `${apiEndpoint.userEndpoint}/users`,
  getRole: `${apiEndpoint.userEndpoint}/roles`,
  getTeamDetail: `${apiEndpoint.teamEndpoint}/`,
  getTeamRole: `${apiEndpoint.teamEndpoint}/roles`,
  getAllInsurers: `${apiEndpoint.carEndpoint}/insurers`,
  user: {
    create: `${apiEndpoint.userEndpoint}/users`,
    getTeamByUser: `${apiEndpoint.teamEndpoint}/teams/-/members`,
    list: `${apiEndpoint.userEndpoint_v2}/users`,
    get: `${apiEndpoint.userEndpoint}/users`,
    importUser: `${apiEndpoint.nestEndpoint}/users/import`,
    lookUpUser: `${apiEndpoint.lookUpUserEndPoint}/lookup`,
  },
  team: {
    create: `${apiEndpoint.teamEndpoint}/teams`,
    update: `${apiEndpoint.teamEndpoint}`,
    lookupTeam: `${apiEndpoint.lookupTeamEndPoint}/lookup`,
    lookupTeamSupervisors: `${apiEndpoint.lookupTeamEndPoint}/lookup/supervisors`,
    lookupTeamManagers: `${apiEndpoint.lookupTeamEndPoint}/lookup/managers`,
  },
  lead: {
    list: `${apiEndpoint.leadEndpoint_v2}/sources`,
    get: `${apiEndpoint.leadEndpoint}/sources`,
    create: `${apiEndpoint.leadEndpoint}/sources`,
    createScore: `${apiEndpoint.scoreEndpoint}/scores/sources`,
    mediumEndpoint: `${apiEndpoint.mediumEndpoint}`,
    campaignEndpoint: `${apiEndpoint.campaignEndpoint}`,
    leadAssignment: `${apiEndpoint.leadAssignment}`,
    importList: `${apiEndpoint.importLeadEndPoint_v2}/imports`,
    getDownloadLink: `${apiEndpoint.importLeadEndPoint_v2}`,
  },
  call: apiEndpoint.call,
  rejection: {
    create: '/rejections',
  },
  leadDetail: {
    createComment: `${apiEndpoint.leadEndpoint}/leads`,
    sendEmail: `${apiEndpoint.emailEndpoint}/leads`,
    getAttachment: `${apiEndpoint.emailEndpoint}`,
    createAttachment: `${apiEndpoint.emailEndpoint}/leads`,
    sendSms: `${apiEndpoint.smsEndpoint}/leads`,
    addPhone: `${apiEndpoint.nestEndpoint}/leads`,
    addCoupon: `${apiEndpoint.nestEndpoint}/leads`,
    saveAppointment: `${apiEndpoint.saveAppointmentEndpoint}/calendars`,
    deleteAppointment: `${apiEndpoint.deleteAppointmentEndpoint}/calendars`,
    getAppointment: `${apiEndpoint.nestEndpoint}/schedule`,
    addEmail: `${apiEndpoint.nestEndpoint}/leads`,
    addAddressToLeads: `${apiEndpoint.nestEndpoint}/leads`,
    getCommunication: `${apiEndpoint.nestEndpoint}/leads`,
    addLead: `${apiEndpoint.addLeadEndPoint}`,
    getAgent: `${apiEndpoint.addLeadEndPoint}`,
    getProvinces: `${apiEndpoint.provinces}`,
    getCarBySubModel: `${apiEndpoint.getCar}/brands/-/models/-/submodels/-/years`,
    getCarGeneral: `${apiEndpoint.getCar}`,
    getListInsurer: `${apiEndpoint.getCar}/insurers`,
    getPaymentOptions: (leadId: string) =>
      `${apiEndpoint.getPaymentOptions(leadId)}`,
    createLeadToken: (lead: string) => apiEndpoint.leadTokenEndpoint(lead),
    createCustomQuote: (lead: string) => apiEndpoint.customQuote(lead),
    myLead: `${apiEndpoint.myLeads}`,
    bulkImportant: `${apiEndpoint.bulkImportant}`,
    getLeadDetail: `${apiEndpoint.addLeadEndPoint}`,
    getLeadPackage: (leadId: string) => `${apiEndpoint.getLeadPackage(leadId)}`,
    createPaySlit: (leadId: string) =>
      `${apiEndpoint.createPaySlip}/${leadId}/order`,
    updateLead: `${apiEndpoint.leadEndpoint}/leads`,
  },
  package: {
    getAllInsurer: `${apiEndpoint.getCar}/insurers`,
    getAllCarModel: `${apiEndpoint.getCar}/brands/-/models`,
    gettAllCarSubmodel: `${apiEndpoint.getCar}/brands/-/models/-/submodels`,
    getManufacturedYears: `${apiEndpoint.getCar}/manufacturedYears`,
    getBrandsByYear: (year: string | number) =>
      `${apiEndpoint.getCar}/manufacturedYears/${year}/brands`,
    getModelsByYearBrand: (year: string | number, brandId: string | number) =>
      `${apiEndpoint.getCar}/manufacturedYears/${year}/brands/${brandId}/models`,
    getSubmodelsByBrandModel: (
      brandId: string | number,
      modelId: string | number
    ) => `${apiEndpoint.getCar}/brands/${brandId}/models/${modelId}/submodels`,
    getImportedPackageHistory: `${apiEndpoint.packageImported}/v1alpha1/imports`,
    getPackageImportDownloadUrl: `${apiEndpoint.packageImported}/v1alpha1`,
  },
  leadImport: {
    getImportDownloadUrlBase: `${apiEndpoint.leadImportMain}/v1alpha1`,
  },
  customerProfile: {
    getCustomerProfileImportDownloadUrl: `${apiEndpoint.leadImportMain}/v1alpha1`,
  },
};

export const userFilter = {
  manager: 'role="roles/manager"',
  supervisor: 'role="roles/supervisor"',
};

export const netWorkErrorMessage = 'Network Error';

export const USERS_LIST_LENGTH_TO_COMPARE = 200;

export const DELAY_DATA_TABLE_LOADING = 300;

export const ADD_LEAD_SCHEMA_ID =
  'schemas/efce3390-8da6-44b3-9e4c-2c7b78ca2c9d';

export const UNIT_OF_INSURED = 'THB';
export const UNIT_OF_ENGINE_SIZE = 'CC';

export const globalAccessUserRoles = [
  'roles/admin',
  'roles/super-admin',
  'roles/manager',
  'roles/inbound',
  'roles/supervisor',
];

export enum LEAD_TYPE {
  DEFAULT = 'LEAD_TYPE_UNSPECIFIED',
  NEW = 'LEAD_TYPE_NEW',
  RETAINER = 'LEAD_TYPE_RETAINER',
  RENEWAL = 'LEAD_TYPE_RENEWAL',
}

export const DOCUMENT_MAX_SIZE = 2;

export const VALID_NUMBER_PATTERN = /^\d*\.?\d*$/;

export const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"#$%^&*]+(\.[^<>()\[\]\\.,;:\s@"#$%^&*]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export enum LEAD_STATUS {
  NEW = 'LEAD_STATUS_NEW',
}

export const ADD_HEALTH_LEAD_SCHEMA_ID =
  'schemas/7fc04d43-2287-41f3-bdbf-04e5229e963d';
