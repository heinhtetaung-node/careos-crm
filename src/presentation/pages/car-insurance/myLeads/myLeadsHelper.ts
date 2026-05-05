import get from 'lodash/get';
import has from 'lodash/has';
import { Observable } from 'rxjs';
import { delayWhen, map, pluck } from 'rxjs/operators';

import LeadDetailRepository from 'data/repository/leadDetail';
import { getString } from 'presentation/theme/localization';
import { getValidAppointmentDate } from 'shared/helper/AppointmentLogicHelper';
import { delayLoading } from 'shared/helper/operator';
import {
  formatDDMMYYYY,
  formatDDMMYYYYHHMMSS,
  formatTimeAgo,
  getRenewalPackageStatus,
  getYesNoOptions,
  modelValidationField,
} from 'shared/helper/utilities';

import { showRemark } from 'data/slices/leadSearchSlice/helper';
import {
  LeadType,
  StatusLeadAll,
} from '../leads/LeadDashBoard/LeadDashBoard.helper';

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: any;
  noTooltip?: boolean;
  breakSpace?: boolean;
  sorting?: 'none' | 'asc' | 'desc';
  field?: string;
  sortingField?: string;
  disabled?: boolean;
}

export interface FilterDateInterface {
  criteria: string;
  range: {
    startDate: string | any;
    endDate: string | any;
  };
}

export const columns: Column[] = [
  {
    id: 'unreadMessage',
    field: 'unreadMessage',
    label: 'text.unreadMessage',
    minWidth: 125,
    sorting: 'none',
    sortingField: '',
    disabled: true,
  },
  {
    id: 'leadId',
    field: 'leadId',
    label: 'text.leadId',
    minWidth: 120,
    sorting: 'none',
    sortingField: 'lead.humanId',
  },
  {
    id: 'name',
    field: 'name',
    label: 'text.name',
    minWidth: 150,
    sorting: 'none',
    sortingField: '',
    disabled: true,
  },
  {
    id: 'leadStatus',
    field: 'leadStatus',
    label: 'text.leadStatus',
    minWidth: 150,
    breakSpace: true,
    sorting: 'none',
    sortingField: 'lead.status',
  },
  {
    id: 'licensePlate',
    field: 'licensePlate',
    label: 'text.licensePlate',
    minWidth: 150,
    sorting: 'none',
    sortingField: 'car.licensePlate',
  },
  {
    id: 'leadType',
    field: 'leadType',
    label: 'text.leadType',
    minWidth: 150,
    sorting: 'none',
    sortingField: 'lead.type',
  },
  {
    id: 'remark',
    field: 'remark',
    label: 'text.remark',
    minWidth: 100,
    noTooltip: true,
    sorting: 'none',
    sortingField: '',
    disabled: true,
  },
  {
    id: 'policyStartDate',
    field: 'policyStartDate',
    label: 'text.policyStartDate',
    format: 'date',
    minWidth: 200,
    sorting: 'none',
    sortingField: 'lead.data.policyStartDate',
  },
  {
    id: 'appointmentDate',
    field: 'appointmentDate',
    label: 'text.appointmentDate',
    format: 'date',
    minWidth: 200,
    sorting: 'none',
    sortingField: 'appointments.startTime',
  },
  {
    id: 'callAttempts',
    field: 'callAttempts',
    label: 'text.callAttempts',
    minWidth: 150,
    sorting: 'none',
    sortingField: 'attributes.callAttempts',
  },
  {
    id: 'lastCallDate',
    field: 'lastCallDate',
    label: 'text.lastCallDate',
    format: 'date',
    minWidth: 200,
    sorting: 'none',
    sortingField: 'attributes.lastCallTimestamp',
  },
  {
    id: 'daysSinceLastCall',
    field: 'daysSinceLastCall',
    label: 'text.daysSinceLastCall',
    minWidth: 150,
    sorting: 'none',
    sortingField: '',
    disabled: true,
  },
  {
    id: 'renewalPackageStatus',
    field: 'renewalPackageStatus',
    label: 'text.renewalPackageStatus',
    minWidth: 180,
    noTooltip: true,
    sorting: 'none',
    sortingField: '',
    disabled: true,
  },
  {
    id: 'paymentCall',
    field: 'paymentCall',
    label: 'text.paymentCall',
    minWidth: 150,
    noTooltip: true,
    sorting: 'none',
    sortingField: '',
    disabled: true,
  },
  {
    id: 'renewalId',
    field: 'renewalId',
    label: 'text.renewalId',
    minWidth: 150,
    sorting: 'none',
    sortingField: '',
    disabled: true,
  },
  {
    id: 'sumInsured',
    field: 'sumInsured',
    label: 'text.preferredSumInsured',
    minWidth: 150,
    sorting: 'none',
    sortingField: 'car.sumInsured',
  },
  {
    id: 'sundayContactable',
    field: 'sundayContactable',
    label: 'text.sundayContactable',
    minWidth: 150,
    sorting: 'none',
    sortingField: '',
    disabled: true,
  },
  {
    id: 'createdOn',
    field: 'createdOn',
    label: 'text.createdOn',
    format: 'date',
    minWidth: 150,
    breakSpace: true,
    sorting: 'desc',
    sortingField: 'lead.createTime',
  },
  {
    id: 'updatedOn',
    field: 'updatedOn',
    label: 'text.updatedOn',
    format: 'date',
    minWidth: 150,
    breakSpace: true,
    sorting: 'none',
    sortingField: 'lead.updateTime',
  },
  {
    id: 'assignedOn',
    field: 'assignedOn',
    label: 'text.assignOn',
    format: 'date',
    minWidth: 150,
    breakSpace: true,
    sorting: 'none',
    sortingField: 'assigned.createTime',
  },
  {
    id: 'carBrand',
    field: 'carBrand',
    label: 'text.carBrand',
    minWidth: 150,
    sorting: 'none',
    sortingField: '',
    disabled: true,
  },
  {
    id: 'carModel',
    field: 'carModel',
    label: 'text.carModel',
    minWidth: 150,
    sorting: 'none',
    sortingField: '',
    disabled: true,
  },
  {
    id: 'carYear',
    field: 'carYear',
    label: 'text.carYear',
    minWidth: 150,
    sorting: 'none',
    sortingField: '',
    disabled: true,
  },
];
export interface IPageState {
  currentPage?: number;
  perPage?: number;
  pageSize?: number;
  pageToken?: string;
  showDeleted?: boolean;
  filter?: string;
  orderBy?: string;
}
export const INITIAL_ITEM_PER_PAGE = 15;

export const initialPageState: IPageState = {
  currentPage: 1,
  pageSize: 15,
  pageToken: '',
  showDeleted: true,
  orderBy: '',
  filter: '',
};

export interface IToken {
  page: number;
  token: string;
}

export const listToken = [
  { token: '1', page: 1 },
  { token: '2', page: 2 },
  { token: '', page: 3 },
];

export interface IRowMyLead {
  id: number;
  unreadMessage: number;
  important: boolean;
  detailLead: boolean;
  name: string;
  sumInsured: number;
  leadStatus: string;
  leadType: string;
  remark: string;
  policyStartDate: string;
  appointmentDate: string;
  paymentCall: string;
  connectedDials: number;
  failedDials: number;
  totalDials: number;
  leadId: string;
  renewalId: string;
  licensePlate: string;
  customerId: string;
  createdBy: string;
  createdOn: string;
  updatedOn: string;
  assignedOn: string;
  lastVisitedOn: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  isChecked?: boolean;
}

export interface IMyLeadData {
  page: number;
  nextPageToken: string;
  data: IRowMyLead[];
}

export const checkRowImportant = (countAdd: number, countRemove: number) => {
  let disableStarHandleBtn = {
    addStar: true,
    removeStar: true,
  };

  if (countAdd > 0 && countRemove > 0) {
    disableStarHandleBtn = {
      addStar: false,
      removeStar: false,
    };
    return disableStarHandleBtn;
  }
  if (countAdd > 0 && countRemove < 1) {
    disableStarHandleBtn = {
      addStar: false,
      removeStar: true,
    };
    return disableStarHandleBtn;
  }
  if (countAdd < 1 && countRemove > 0) {
    disableStarHandleBtn = {
      addStar: true,
      removeStar: false,
    };
    return disableStarHandleBtn;
  }
  return disableStarHandleBtn;
};

export enum TypeStar {
  ADD = 'ADD',
  REMOVE = 'REMOVE',
}

export enum TypeShowImportantStar {
  STAR = 'STAR',
  ALL = 'ALL',
}

export const IS_ADD_STAR = true;

export enum SORT_TABLE_TYPE {
  NONE = 'none',
  ASC = 'asc',
  DESC = 'desc',
}

export const changeSortStatus = (status: SORT_TABLE_TYPE) => {
  if (status === SORT_TABLE_TYPE.NONE) return SORT_TABLE_TYPE.ASC;
  if (status === SORT_TABLE_TYPE.ASC) return SORT_TABLE_TYPE.DESC;
  return SORT_TABLE_TYPE.NONE;
};

const customerLeadStatus = (status: string) => {
  const findLeadStatus = StatusLeadAll.find((item) => item.value === status);
  return getString(findLeadStatus?.title || '');
};

const customerLeadType = (type: string) => {
  const findLeadType = LeadType.find((item) => item.value === type);
  return getString(findLeadType?.title || '');
};

export const formatMyLeads = (
  leadData: any[],
  searchRange?: FilterDateInterface
) =>
  leadData.map((item) => ({
    id: item?.lead?.name,
    unreadMessage: item.attributes?.unreadEmailCount || 0,
    leadDetailId: item?.lead?.name ? item.lead.name.replace('leads/', '') : '',
    fullLeadId: modelValidationField(item?.lead?.name),
    paymentCall: '',
    remark: item?.lead?.annotations?.remark
      ? showRemark(item.lead.annotations.remark)
      : '',
    name: `${modelValidationField(
      item?.lead?.data?.customerFirstName
    )} ${modelValidationField(item?.lead?.data?.customerLastName)}`,
    leadStatus: customerLeadStatus(item?.lead?.status || ''),
    leadType: customerLeadType(item?.lead?.type || ''),
    createdOn: formatDDMMYYYYHHMMSS(item?.lead?.createTime),
    updatedOn: formatDDMMYYYYHHMMSS(item?.lead?.updateTime),
    assignedOn: formatDDMMYYYYHHMMSS(item?.assigned?.createTime),
    policyStartDate: formatDDMMYYYY(item?.insurance?.policyStartDate),
    teamName: modelValidationField(item?.team?.displayName),
    sumInsured: modelValidationField(item?.car?.sumInsured),
    appointmentDate: item?.appointments?.length
      ? getValidAppointmentDate(item.appointments, searchRange)
      : '',
    leadId: modelValidationField(item?.lead?.humanId || ''),
    licensePlate: modelValidationField(item?.car?.licensePlate),
    customerId: modelValidationField(item?.customer?.humanId),
    carBrand: modelValidationField(item?.car?.brand),
    carModel: modelValidationField(item?.car?.model),
    carYear: modelValidationField(item?.car?.year),
    isChecked: false,
    isRejected: item?.lead?.isRejected,
    failedDials: '',
    connectedDials: '',
    totalDials: '',
    renewalId: '',
    lastVisitedOn: '',
    important: item?.lead?.important ?? false,
    rejections: item?.rejections || [],
    renewalPackageStatus: item?.attributes?.insurerAcceptedStatus
      ? getString(
          getRenewalPackageStatus(item.attributes.insurerAcceptedStatus)
        )
      : '',
    sundayContactable: has(item, 'attributes.sundayContactable')
      ? getString(getYesNoOptions(get(item, 'attributes.sundayContactable')))
      : '',
    highlightColor: item?.attributes?.highlightColor ?? null,
    callAttempts: item?.attributes?.callAttempts ?? '0',
    lastCallDate: formatDDMMYYYYHHMMSS(item?.attributes?.lastCallTimestamp),
    daysSinceLastCall: formatTimeAgo(item?.attributes?.lastCallTimestamp),
  }));

export const getTeamId = (teamByUser: any) =>
  teamByUser.members?.length
    ? teamByUser.members[0].name.substring(
        0,
        teamByUser.members[0].name.indexOf('/members')
      )
    : '';

export const getMyLeadsApi = (
  product: string,
  pageState?: IPageState & {
    assignedTo: string;
    date?: FilterDateInterface;
    date2?: FilterDateInterface;
  },
  delayTime = 0
): Observable<any> => {
  const leadDetailRepository = new LeadDetailRepository();
  const productType = product || 'products/car-insurance';
  return leadDetailRepository
    .getMyLeads(productType.replace('products/', ''), pageState, delayTime)
    .pipe(
      pluck('data'),
      delayWhen(delayLoading),
      map((res: any) => {
        if (
          pageState?.date?.criteria === 'appointmentTime' ||
          pageState?.date2?.criteria === 'appointmentTime'
        ) {
          return {
            data: formatMyLeads(res.leads, pageState?.date ?? pageState?.date2),
            totalItem: res.total,
          };
        }
        return {
          data: formatMyLeads(res.leads),
          totalItem: res.total,
        };
      })
    );
};
