import { getString } from 'presentation/theme/localization';
import { LEAD_TYPE } from 'shared/constants';

enum TABLE_LEAD_TYPE {
  LEAD_ALL = 'LEAD_ALL',
  LEAD_ASSIGNMENT = 'LEAD_ASSIGNMENT',
  LEAD_REJECTION = 'LEAD_REJECTION',
  LEAD_MYLEAD = 'LEAD_MYLEAD',
}

export const SearchFieldLeadAll = [
  { id: 1, title: 'text.select', value: '' },
  { id: 2, title: 'searchFieldLeadOption.customerName', value: 'customerName' },
  {
    id: 3,
    title: 'searchFieldLeadOption.customerPhone',
    value: 'customerPhone',
  },
  {
    id: 4,
    title: 'searchFieldLeadOption.customerEmail',
    value: 'customerEmail',
  },
  { id: 5, title: 'searchFieldLeadOption.leadId', value: 'id' },
  { id: 6, title: 'searchFieldLeadOption.licensePlate', value: 'licensePlate' },
  {
    id: 7,
    title: 'searchFieldLeadOption.reference',
    value: 'reference',
  },
  {
    id: 8,
    title: 'text.chassisNumber',
    value: 'chassisNumber',
  },
];

export const SelectDateTypeLeadAll = [
  { id: 1, title: 'text.select', value: '' },
  { id: 2, title: 'dateTypeLeadOption.createOn', value: 'createTime' },
  { id: 3, title: 'dateTypeLeadOption.updateOn', value: 'updateTime' },
  { id: 4, title: 'dateTypeLeadOption.assignOn', value: 'assignTime' },
  {
    id: 5,
    title: 'dateTypeLeadOption.policyStartOn',
    value: 'policyStartTime',
  },
  {
    id: 6,
    title: 'dateTypeLeadOption.policyExpiryOn',
    value: 'policyExpiryTime',
  },
  {
    id: 7,
    title: 'dateTypeLeadOption.appointedOn',
    value: 'appointmentTime',
  },
];

export const SelectDateTypeOrderApproval = [
  { id: 6, title: 'order.shipping.insuranceApprovedOn', value: 'approvalTime' },
];

export const StatusLeadAll = [
  { id: 1, title: 'leadStatus.new', value: 'LEAD_STATUS_NEW' },
  { id: 2, title: 'leadStatus.valid', value: 'LEAD_STATUS_VALID' },
  { id: 3, title: 'leadStatus.contacted', value: 'LEAD_STATUS_CONTACTED' },
  { id: 4, title: 'leadStatus.interested', value: 'LEAD_STATUS_INTERESTED' },
  { id: 5, title: 'leadStatus.prospect', value: 'LEAD_STATUS_PROSPECT' },
  {
    id: 6,
    title: 'leadStatus.pendingPayment',
    value: 'LEAD_STATUS_PENDING_PAYMENT',
  },
  { id: 6, title: 'leadStatus.purchased', value: 'LEAD_STATUS_PURCHASED' },
  { id: 6, title: 'leadStatus.cancelled', value: 'LEAD_STATUS_CANCELLED' },
  { id: 7, title: 'leadStatus.paidOnline', value: 'LEAD_STATUS_PAID_ONLINE' },
  {
    id: 8,
    title: 'leadStatus.invalidNumber',
    value: 'LEAD_STATUS_INVALID_NUMBER',
  },
];

export const LeadType = [
  { id: 1, title: 'leadTypeFilter.new', value: LEAD_TYPE.NEW },
  { id: 2, title: 'leadTypeFilter.retainer', value: LEAD_TYPE.RETAINER },
  { id: 3, title: 'leadTypeFilter.renewal', value: LEAD_TYPE.RENEWAL },
];

export const DuplicateLead = [
  {
    id: 1,
    value: 'all',
    title: 'autoAssignOption.all',
  },
  {
    id: 2,
    value: 'true',
    title: 'autoAssignOption.yes',
  },
  {
    id: 3,
    value: 'false',
    title: 'autoAssignOption.no',
  },
];

export const trueFalseOptions = [
  {
    id: 2,
    value: true,
    title: 'autoAssignOption.yes',
  },
  {
    id: 3,
    value: false,
    title: 'autoAssignOption.no',
  },
];

export const RejectedLead = [
  {
    id: 1,
    value: 'all',
    title: 'genericOption.all',
  },
  {
    id: 2,
    value: 'true',
    title: 'genericOption.yes',
  },
  {
    id: 3,
    value: 'false',
    title: 'genericOption.no',
  },
];

export default TABLE_LEAD_TYPE;

export const INITIAL_VALUES = {
  search: { key: '', value: '' },
  date: {
    startDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
    endDate: {
      criteria: '',
      range: { startDate: null, endDate: null },
    },
  },
  source: [],
  leadStatus: [],
  carBrand: [],
  leadType: [],
  assignToUser: [],
  assignToTeam: [],
  sumInsured: [0, 0],
  lastPremium: [0, 0],
  duplicateLead: '',
  rejectionReasons: [],
  rejectedLead: '',
};

export const DEFAULT_PER_PAGE = 15;

export const RenewalStatuses = [
  { id: 1, title: 'renewalStatus.all', value: 'all' },
  { id: 2, title: 'renewalStatus.accepted', value: 'ACCEPTED' },
  {
    id: 3,
    title: 'renewalStatus.unspecified',
    value: 'UNSPECIFIED',
  },
  { id: 4, title: 'renewalStatus.declined', value: 'DECLINED' },
];

export const YesNoOptions = [
  {
    id: 1,
    value: 'true',
    title: 'genericOption.yes',
  },
  {
    id: 2,
    value: 'false',
    title: 'genericOption.no',
  },
];

export function handleUserData(data: any, includeUnassigned = false) {
  const userData = includeUnassigned
    ? [
        {
          id: '',
          fullName: `(${getString('text.unassigned')})`,
          value: '',
          name: '',
        },
      ]
    : [];

  data?.users.forEach((x: any) => {
    userData.push({
      id: x.name,
      name: x.name,
      value: x.name,
      fullName: x.displayName,
    });
  });

  return userData;
}
