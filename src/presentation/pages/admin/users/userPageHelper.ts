import { camelCase } from 'lodash';

import {
  FilterMapType,
  buildFilter,
} from 'data/gateway/api/resource/leadSearch';
import { getString } from 'presentation/theme/localization';
import { csvUserColumns } from 'shared/constants/csvUserColumns';
import { NewDateFormatters } from 'shared/helper/utilities';
import { IUser } from 'shared/interfaces/common/admin/user';
import { IPageState } from 'shared/interfaces/common/table';
import { Column } from 'presentation/hooks/useTableList';

export const initialPageState: IPageState = {
  currentPage: 1,
  pageIndex: 0,
  pageSize: 5,
  pageToken: '',
  showDeleted: true,
  filter: '',
};

const getContentCsv = (listUser: IUser[]) => {
  const csvColumns = [[...csvUserColumns]];
  const csvUserData = listUser.map((item: any) => [
    item.displayRole,
    item.firstName,
    item.lastName,
    item.humanId,
    item.teamProduct,
    item.teamDisplayName,
    item.annotations.daily_limit,
    item.annotations.total_limit,
    item.annotations.score,
    item.annotations.license_no,
    item.annotations.license_issue_date,
    item.annotations.license_expiry_date,
    item.status,
  ]);
  return `${csvColumns}\n${csvUserData.map((e) => e.join(',')).join('\n')}`;
};

export const download = (listUser: IUser[]) => {
  const csvContent = getContentCsv(listUser);
  const link = document.createElement('a');
  link.setAttribute('download', 'template.csv');
  link.setAttribute('href', `data:text/plain;charset=utf-8,${csvContent}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};
export const userRolesText = (role: string) => {
  if (!role || (role && role === '')) return '';
  const key = role.split('/').pop();

  return getString(`roles.${camelCase(key)}`);
};

export const columnV2 = (excluded: string[] = []): Column[] => {
  const { DDMMYYYY } = NewDateFormatters();
  const columns: Column[] = [
    {
      id: 'humanId',
      field: 'user.humanId.keyword',
      label: 'text.user',
      align: 'center',
      format: 'string',
      sorting: 'none',
    },
    {
      id: 'fullName',
      field: 'user.fullName.keyword',
      label: 'text.name',
      format: 'string',
      sorting: 'none',
    },
    {
      id: 'productLabel',
      field: 'user.teamProduct.keyword',
      label: 'text.product',
      format: 'string',
      sorting: 'none',
    },
    {
      id: 'teamDisplayName',
      field: 'user.teamDisplayName.keyword',
      label: 'text.team',
      format: 'string',
      sorting: 'none',
    },
    {
      id: 'role',
      field: 'user.role.keyword',
      label: 'text.userRole',
      format: 'string',
      sorting: 'none',
      transform: ({ role }: any) =>
        getString(`roles.${camelCase(role?.split('/').pop())}`),
    },
    {
      id: 'annotations',
      disabled: true,
      field: 'user.annotations.score.keyword',
      label: 'text.agentScore',
      format: 'string',
      align: 'center',
      sorting: 'none',
      noTooltip: true,
      transform: ({ annotations }: any) => annotations?.score || '_',
    },
    {
      id: 'status',
      field: 'user.deleteTime',
      label: 'text.status',
      format: 'string',
      sorting: 'none',
      transform: ({ deleteTime }: any) => (deleteTime ? 'Suspended' : 'Active'),
    },
    {
      id: 'loginTime',
      field: 'user.loginTime',
      label: 'text.lastLoginOn',
      format: 'date',
      sorting: 'none',
      transform: ({ loginTime }: any) => DDMMYYYY(loginTime),
    },
    {
      id: 'licenseNo',
      field: 'user.annotations.license_no',
      label: 'text.licenseNo',
      format: 'date',
      sorting: 'none',
      transform: ({ annotations }: any) => annotations?.license_no || '_',
    },
    {
      id: 'licenseIssueDate',
      field: 'user.annotations.license_issue_date',
      label: 'dateType.licenseIssueDate',
      format: 'date',
      sorting: 'none',
      transform: ({ annotations }: any) =>
        annotations?.license_issue_date
          ? DDMMYYYY(annotations.license_issue_date)
          : '_',
    },
    {
      id: 'licenseExpiryDate',
      field: 'user.annotations.license_expiry_date',
      label: 'dateType.licenseExpiryDate',
      format: 'date',
      sorting: 'none',
      transform: ({ annotations }: any) =>
        annotations?.license_expiry_date
          ? DDMMYYYY(annotations.license_expiry_date)
          : '_',
    },
    {
      id: 'createByFullName',
      field: 'user.createByFullName.keyword',
      label: 'text.createBy',
      format: 'string',
      sorting: 'none',
    },
    {
      id: 'createTime',
      field: 'user.createTime',
      label: 'text.createOn',
      format: 'date',
      sorting: 'desc',
      transform: ({ createTime }: any) => DDMMYYYY(createTime),
    },
    {
      id: 'updateTime',
      field: 'user.updateTime',
      label: 'text.updatedOn',
      format: 'date',
      sorting: 'none',
      transform: ({ updateTime }: any) => DDMMYYYY(updateTime),
    },
  ];

  return columns.filter((column) => !excluded.includes(column.id));
};

export const fieldMapper: FilterMapType[] = [
  {
    filter: 'humanId.humanId',
    type: 'contain',
    field: 'user.humanId',
  },
  {
    filter: 'userFullName',
    type: 'contain',
    field: 'user.fullName',
  },
  {
    filter: 'annotations',
    type: 'multi',
    field: 'user.annotations.score',
    callback: (annotation: { [key: string]: string }) => annotation.value,
  },
  {
    filter: 'dateTime',
    type: 'choiceDate',
    options: [
      { filter: 'createTime', field: 'user.createTime' },
      { filter: 'updateTime', field: 'user.updateTime' },
      {
        filter: 'licenseIssueDate',
        field: 'user.annotations.license_issue_date',
      },
      {
        filter: 'licenseExpiryDate',
        field: 'user.annotations.license_expiry_date',
      },
    ],
  },
  {
    filter: 'teamProduct',
    type: 'multi',
    field: 'user.product',
    callback: (product: { [key: string]: string }) => product.value,
  },
  {
    filter: 'teamDisplayName',
    type: 'multi',
    field: 'user.teamDisplayName.keyword',
    callback: (team: { [key: string]: string }) => team.displayName,
  },
  {
    filter: 'role',
    type: 'multi',
    field: 'user.role.keyword',
    callback: (role: { [key: string]: string }) => role.name,
  },
  {
    filter: 'createBy.id',
    type: 'exact',
    field: 'user.createBy',
    callback: (user: Record<string, string>) => user.name,
  },
  {
    filter: 'licenseNo',
    type: 'contain',
    field: 'user.annotations.license_no',
  },
];

export const getFilterPanelQueryString = ({ filters }: { filters: any }) => {
  const filterStrings = [...buildFilter(filters, fieldMapper, [], false)];
  return filterStrings.join(' ');
};
