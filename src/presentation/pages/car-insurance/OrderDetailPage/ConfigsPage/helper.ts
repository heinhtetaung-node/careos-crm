import { format } from 'date-fns';

import UserSourceCloud from 'data/repository/admin/user/cloud';
import {
  getFormattedGroup,
  getFormattedOrderBy,
} from 'data/slices/orderSlice/helper';
import Controls from 'presentation/components/controls/Control';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import { getDefaultEffectiveDate } from 'presentation/pages/admin/AutoAssign/Configs/helper';
import { getString } from 'presentation/theme/localization';
import { statusOptions } from 'shared/helper/selectOptions';
import { buildFilter } from 'utils/url';

export interface FilterPayload {
  effectiveDate: Date;
  status: string;
  name: Record<any, any>[];
  group: Record<any, any>[];
}

export interface ConfigImport {
  assignedOrder: number;
  configId: string;
  effectiveDate: string;
  group: string;
  name: string;
  status: string;
}

export interface OrderConfigType {
  imports: ConfigImport[];
  total: number;
}

export const initialAgentState = {
  id: '',
  value: '',
  title: '',
};

const constFields = {
  minWidth: 100,
  sorting: 'none',
  disabled: false,
};

export const getGroupOptions = (isNewGroup: boolean) =>
  [
    {
      id: 0,
      title: getFormattedGroup.QC_CASH_INSTALLMENT,
      value: 'QC_CASH_INSTALLMENT',
    },
    {
      id: 1,
      title: getFormattedGroup.QC_NON_CASH_INSTALLMENT,
      value: 'QC_NON_CASH_INSTALLMENT',
    },
    {
      id: 2,
      title: getFormattedGroup.SUBMISSION_EMAIL,
      value: 'SUBMISSION_EMAIL',
    },
    {
      id: 3,
      title: getFormattedGroup.SUBMISSION_WEB_PORTAL,
      value: 'SUBMISSION_WEB_PORTAL',
    },
    {
      id: 4,
      title: getFormattedGroup.SUBMISSION_BATCH_FILE,
      value: 'SUBMISSION_BATCH_FILE',
    },
    isNewGroup && {
      id: 5,
      title: getFormattedGroup.SUBMISSION_DHIPAYA,
      value: 'SUBMISSION_DHIPAYA',
    },
    {
      id: 6,
      title: getFormattedGroup.QC_MOTORBIKE,
      value: 'QC_MOTORBIKE',
    },
    {
      id: 7,
      title: getFormattedGroup.SUBMISSION_MOTORBIKE,
      value: 'SUBMISSION_MOTORBIKE',
    },
  ].filter((opt) => opt);

export const columns = [
  {
    id: 'status',
    field: 'status',
    label: 'text.status',
    ...constFields,
  },
  {
    id: 'group',
    field: 'group',
    label: 'text.group',
    ...constFields,
  },
  {
    id: 'name',
    field: 'name',
    label: 'text.name',
    ...constFields,
  },
  {
    id: 'effectiveDate',
    field: 'effectiveDate',
    label: 'menu.autoAssignment.effectiveDate',
    ...constFields,
  },
  {
    id: 'assignedOrder',
    field: 'assignedOrder',
    label: 'text.assignedOrder',
    ...constFields,
  },
];

export const filterFields: (isNewGroup: boolean) => IFilterFormField[] = (
  isNewGroup
) => [
  {
    InputComponent: Controls.Select,
    inputProps: {
      name: 'status',
      label: getString('text.status'),
      placeholder: getString('text.select'),
      options: statusOptions,
      labelField: 'title',
      multiple: false,
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'group',
      label: getString('text.group'),
      placeholder: getString('text.group'),
      options: getGroupOptions(isNewGroup),
      labelField: 'title',
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'name',
      label: getString('text.name'),
      async: true,
      placeholder: getString('text.name'),
      asyncFn: () =>
        UserSourceCloud.getUsersWithTeams({
          filter: `role in ("roles/submission","roles/quality-control")`,
          orderBy: '',
          pageSize: 10000,
          pageToken: '',
          showDeleted: false,
        }),
      labelField: 'fullName',
      valueField: 'name',
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  {
    InputComponent: Controls.KeyBoardDatePicker,
    inputProps: {
      name: 'effectiveDate',
      placeholder: getString('text.enterEffectiveDate'),
      label: getString('menu.autoAssignment.effectiveDate'),
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
];

export const tableInitialValues = {
  status: '',
  group: [],
  name: [],
  effectiveDate: null,
};

export const initialFilter = `config.effectiveDate="${getDefaultEffectiveDate()}"`;
export const agentsFilter =
  'filter=role in ("roles/submission","roles/quality-control")&pageSize=500';

export const formatFilterURI = (payload: FilterPayload) => {
  let URI = '';
  const { status, group, effectiveDate, name } = payload;

  if (status?.length > 0) {
    URI += `config.absent=${status === '1'} `;
  }

  if (effectiveDate) {
    URI += `config.effectiveDate="${format(effectiveDate, 'yyyy-MM-dd')}"`;
  }

  URI += buildFilter(
    { group, name },
    { ...getFormattedOrderBy, name: 'user.name' }
  );

  return URI;
};
