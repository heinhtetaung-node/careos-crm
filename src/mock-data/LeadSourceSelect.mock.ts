export const Type = [
  { id: '1', title: 'leadSourceTypes.online', value: true },
  { id: '2', title: 'leadSourceTypes.offline', value: false },
];

export const Source = [
  { id: '1', title: 'Google' },
  { id: '2', title: 'Facebook' },
  { id: '3', title: 'Viriyah' },
  { id: '4', title: 'Dhipaya' },
];

export const UtmMedium = [
  { id: '1', title: 'Google' },
  { id: '2', title: 'Facebook' },
  { id: '3', title: 'Viriyah' },
  { id: '4', title: 'Dhipaya' },
];

export const UtmCampaign = [
  { id: '1', title: 'Google' },
  { id: '2', title: 'Facebook' },
  { id: '3', title: 'Viriyah' },
  { id: '4', title: 'Dhipaya' },
];

export const Product = [
  { id: '1', title: 'Car Insurance' },
  { id: '2', title: 'Health Insurance' },
  { id: '3', title: 'Life Insurance' },
];

export const Hide = [
  { id: '1', title: 'hideOption.no', value: false },
  { id: '2', title: 'hideOption.yes', value: true },
];

export const AutoAssign = [
  { id: '1', title: 'autoAssignOption.all', value: '' },
  { id: '2', title: 'autoAssignOption.yes', value: 'true' },
  { id: '3', title: 'autoAssignOption.no', value: 'false' },
];

export const UpdatedBy = [
  { id: '1', title: 'Me' },
  { id: '2', title: 'You' },
  { id: '3', title: 'Both' },
];

export const SelectDateType = [
  { id: '1', title: 'text.select', value: '' },
  { id: '2', title: 'dateType.createdOn', value: 'createTime' },
  { id: '3', title: 'dateType.updatedOn', value: 'updateTime' },
];

export const RejectReason = [
  {
    id: 1,
    value: 'wrong_number',
    title: 'rejectReason.wrongNumber',
  },
  {
    id: 2,
    value: 'cant_contact',
    title: 'rejectReason.cantContact',
  },
  { id: 3, value: 'no_car', title: 'rejectReason.noCar' },
  { id: 4, value: 'dont_call', title: 'rejectReason.dontCall' },
  {
    id: 5,
    value: 'not_expiring',
    title: 'rejectReason.notExpiring',
  },
  {
    id: 6,
    value: 'already_purchased',
    title: 'rejectReason.purchasedFromOther',
  },
  {
    id: 7,
    value: 'already_purchased_rabbit',
    title: 'rejectReason.purchasedFromRabbit',
  },
];

export const LeadStatus = [
  {
    id: 1,
    value: 'LEAD_STATUS_NEW',
    title: 'leadStatus.new',
  },
  {
    id: 2,
    value: 'LEAD_STATUS_VALID',
    title: 'leadStatus.valid',
  },
  {
    id: 3,
    value: 'LEAD_STATUS_CONTACTED',
    title: 'leadStatus.contacted',
  },
  {
    id: 4,
    value: 'LEAD_STATUS_INTERESTED',
    title: 'leadStatus.interested',
  },
  {
    id: 5,
    value: 'LEAD_STATUS_PROSPECT',
    title: 'leadStatus.prospect',
  },
  {
    id: 6,
    value: 'LEAD_STATUS_PENDING_PAYMENT',
    title: 'leadStatus.pendingPayment',
  },
  {
    id: 10,
    value: 'LEAD_STATUS_INVALID_NUMBER',
    title: 'leadStatus.invalidNumber',
  },
];
