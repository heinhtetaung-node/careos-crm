import { NO_USER_ID, UserRoles } from 'config/constant';
import Controls from 'presentation/components/controls/Control';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import SearchField from 'presentation/components/leads/searchField/SearchField';
import { qcAgentsField } from 'presentation/pages/car-insurance/orders/filterFields';
import { getString } from 'presentation/theme/localization';

import { dateRangeFilter } from '../common/helper';

const SearchOptions = [
  {
    key: 2,
    title: getString('menu.carePay.customerName'),
    value: 'attributes.customerFullName',
  },
  {
    key: 3,
    title: getString('carepay.contract.phone'),
    value: 'attributes.customerPhone',
  },
  {
    key: 4,
    title: getString('carepay.contract.email'),
    value: 'attributes.customerEmail',
  },
  {
    key: 5,
    title: getString('carepay.contract.leadId'),
    value: 'attributes.leadHumanId',
  },
  {
    key: 7,
    title: getString('carepay.contract.nationId'),
    value: 'contract.customerIdCard',
  },
];

export const cancellationStatus = [
  {
    id: 1,
    title: getString('cancellation.pendingOnCustomer'),
    value: 'PENDING',
  },
  {
    id: 2,
    title: getString('cancellation.pendingCancelSubmission'),
    value: 'PENDING_SUBMISSION',
  },
  {
    id: 3,
    title: getString('cancellation.pendingPolicyReturn'),
    value: 'PENDING_RETURN',
  },
  {
    id: 4,
    title: getString('cancellation.pendingEndorsement'),
    value: 'PENDING_ENDORSEMENT',
  },
  { id: 4, title: getString('cancellation.completed'), value: 'COMPLETED' },
];

export const contractStatusOptions = [
  {
    id: 1,
    title: getString('carepay.contractStatus.created'),
    value: 'CREATED',
  },
  {
    id: 2,
    title: getString('carepay.contractStatus.signed'),
    value: 'SIGNED',
  },
  {
    id: 3,
    title: getString('carepay.contractStatus.pending'),
    value: 'PENDING',
  },
  {
    id: 4,
    title: getString('carepay.contractStatus.approved'),
    value: 'APPROVED',
  },
  {
    id: 5,
    title: getString('carepay.contractStatus.rejected'),
    value: 'REJECTED',
  },
  {
    id: 6,
    title: getString('carepay.contractStatus.completed'),
    value: 'COMPLETED',
  },
];

export const noOfInstallments = [
  {
    id: 2,
    title: getString('carepay.availableInstallments.threeMonths'),
    value: '3',
  },
  {
    id: 4,
    title: getString('carepay.availableInstallments.sixMonths'),
    value: '6',
  },
  {
    id: 5,
    title: getString('carepay.availableInstallments.eightMonths'),
    value: '8',
  },
  {
    id: 6,
    title: getString('carepay.availableInstallments.tenMonths'),
    value: '10',
  },
];

const _policyListing = [
  '/orders/approval',
  '/orders/shipment',
  '/orders/submission',
];

export const getFields: (role: string) => IFilterFormField[] = (role) => [
  {
    InputComponent: SearchField,
    inputProps: {
      name: 'search',
      label: getString('text.search'),
      searchOption: SearchOptions,
      fixedLabel: true,
      filterType: 'summary',
      placeholder: getString('text.search'),
      responsive: {
        xs: 6,
        md: 6,
      },
    },
  },
  dateRangeFilter(
    'policyStartDate',
    getString('carepay.contract.policyStartDate'),
    () => {}
  ),
  dateRangeFilter(
    'policyEndDate',
    getString('carepay.contract.policyEndDate'),
    () => {}
  ),
  ...qcAgentsField({
    hideAssignTo: role === UserRoles.QUALITY_CONTROL,
    defaultOptions: [
      {
        value: NO_USER_ID,
        title: getString('text.noAssignee'),
      },
    ],
  }),
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'contractStatus',
      label: getString('carepay.contract.contractStatus'),
      placeholder: getString('carepay.contract.contractStatus'),
      options: contractStatusOptions,
      filterType: 'detail',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
      hasSelectAll: true,
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'noOfInstallments',
      label: getString('carepay.contract.installments'),
      placeholder: getString('carepay.contract.installments'),
      options: noOfInstallments,
      filterType: 'detail',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
      hasSelectAll: true,
    },
  },
  dateRangeFilter('createTime', getString('menu.carePay.createDate'), () => {}),
];

export const initialFilterValues = {
  search: [],
  createTime: {
    range: {
      startDate: null,
      endDate: null,
    },
  },
  policyStartDate: {
    range: {
      startDate: null,
      endDate: null,
    },
  },
  policyEndDate: {
    range: {
      startDate: null,
      endDate: null,
    },
  },
};

type SelectValue = {
  selectValue: string;
  inputValue: string | boolean;
};
export const transformUrlQuerySearch = (
  url: string,
  { selectValue, inputValue }: SelectValue,
  operator: string = '='
): string => {
  if (!selectValue || !inputValue) return '';
  return `${url && ' '}${selectValue}${operator}"${inputValue}"`;
};

export const transformUrlQuerySearchTrueFalse = (
  url: string,
  { selectValue, inputValue }: SelectValue,
  operator: string = '=',
  strictlyBooleanValue: boolean = false
): string => {
  const inputValueString = strictlyBooleanValue
    ? inputValue
    : `"${inputValue}"`;
  return `${url && ' '}${selectValue}${operator}${inputValueString}`;
};

type DateBetween = {
  startDate: Date;
  endDate: Date;
};
export const transformUrlQueryDateBetween = (
  url: string,
  dateBetween: DateBetween,
  fieldName: string
): string => {
  const { startDate, endDate } = dateBetween;
  if (!startDate || !endDate) return '';
  return `${
    url && ' '
  }${fieldName}>='${startDate.toISOString()}' ${fieldName}<='${endDate.toISOString()}'`;
};

export const transformUrlQueryNumberBetween = (
  url: string,
  numbers: Array<number>,
  fieldName: string
): string => {
  const [start, end] = numbers;
  if (!start || !end) return '';
  return `${url && ' '}${fieldName}>=${start} ${fieldName}<=${end}`;
};

type MultiSelectValue = { value: string }[];

export const transformUrlQueryMultiSelect = (
  url: string,
  selected: MultiSelectValue,
  fieldName: string
): string => {
  if (selected.length <= 0) return '';
  const ids = selected.map((select) => select.value);
  const idsStr = ids.toString().replaceAll(',', '","');
  return `${url && ' '}${fieldName} in ("${idsStr}")`;
};

export interface SearchContractPayload {
  search: SelectValue;
  createTime: DateBetween;
  salesAgents: MultiSelectValue;
  contractStatus: MultiSelectValue;
  noOfInstallments: MultiSelectValue;
  policyStartDate: DateBetween;
  policyEndDate: DateBetween;
}
