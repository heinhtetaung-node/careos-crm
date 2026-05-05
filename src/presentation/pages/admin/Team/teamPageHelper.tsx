import React from 'react';
import { hideTeamsInsurerFilter } from 'config/feature-flags';
import {
  FilterMapType,
  buildFilter,
} from 'data/gateway/api/resource/leadSearch';
import TeamCloud from 'data/repository/admin/team/cloud';
import { SearchUserResponse } from 'data/slices/gffSlice/types';
import { Insurers, SelectDateType } from 'mock-data/AdminPage.mock';
import Controls from 'presentation/components/controls/Control';
import DateRangeWithType from 'presentation/components/controls/DateRangeWithType';
import LeadTypeMultiSelector from 'presentation/components/controls/LeadTypeMultiSelector';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import { initialProduct } from 'presentation/redux/reducers/typeSelector/globalProduct';
import {
  getLanguage,
  LANGUAGES,
  getString,
} from 'presentation/theme/localization';
import ProductOptions from 'shared/constants/productOptions';
import { IInsurer } from 'shared/interfaces/common/admin/team';
import { getProductTypeLocale } from 'data/slices/leadSearchSlice/helper';

const MIN_SLIDER = 0;
const MAX_SLIDER = 30;
const STEP_SLIDER = 1;

export interface Column {
  id: string;
  field?: string;
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: any;
  sorting?: 'none' | 'asc' | 'desc';
  noTooltip?: boolean;
  transform?: (data: any) => React.ReactElement | string;
}

export interface IInsurerOption extends IInsurer {
  title: string;
  value: string;
}

export const columns: Column[] = [
  {
    id: 'displayName',
    field: 'displayName',
    label: 'text.teamName',
    minWidth: 100,
    sorting: 'none',
  },
  {
    id: 'productType',
    field: 'productType',
    label: 'text.product',
    minWidth: 100,
    sorting: 'none',
    transform: (data: any) => getProductTypeLocale(data.productType) as string,
  },
  {
    id: 'memberCount',
    field: 'memberCount',
    label: 'text.userCount',
    minWidth: 100,
    sorting: 'none',
    noTooltip: true,
  },
  {
    id: 'leadType',
    field: 'leadType',
    label: 'text.leadType',
    minWidth: 100,
    sorting: 'none',
  },
  {
    id: 'managerFullName',
    field: 'managerFullName',
    label: 'text.manager',
    minWidth: 100,
    sorting: 'none',
  },
  {
    id: 'supervisorFullName',
    field: 'supervisorFullName',
    label: 'text.supervisor',
    minWidth: 100,
    sorting: 'none',
  },
  {
    id: 'createByFullName',
    field: 'createByFullName',
    label: 'text.createBy',
    minWidth: 100,
    sorting: 'none',
  },
  {
    id: 'createTime',
    field: 'createTime',
    label: 'text.createOn',
    minWidth: 100,
    format: 'date',
    sorting: 'desc',
  },
  {
    id: 'updateTime',
    field: 'updateTime',
    label: 'text.updatedOn',
    minWidth: 100,
    format: 'date',
    sorting: 'none',
  },
];

const keywordFields = [
  'displayName',
  'productType',
  'leadType',
  'managerFullName',
  'supervisorFullName',
  'createByFullName',
];

export function newColumns() {
  const fields: Column[] = [];
  columns.forEach((col) => {
    fields.push({
      ...col,
      field: keywordFields.includes(col.id)
        ? `team.${col.field}.keyword`
        : `team.${col.field}`,
    });
  });
  return fields;
}

export const getInsurerOptionsByLanguage = () => {
  const currentLanguage = getLanguage();

  const insurers = (title: 'shortNameTh' | 'shortNameEn'): IInsurerOption[] =>
    Insurers.map((item: IInsurer) => ({
      ...item,
      title: item[title],
      value: item.shortNameEn,
    })).sort((a, b) => a.title.localeCompare(b.title));

  return currentLanguage === LANGUAGES.THAI
    ? insurers('shortNameTh')
    : insurers('shortNameEn');
};

const localeSelectDateType = SelectDateType.map((type) => ({
  ...type,
  title: getString(type.title),
}));

const localeProducts = ProductOptions.map((prod) => ({
  ...prod,
  title: getString(prod.title),
}));

export const getFilterFields = ({
  isNewTeams = false,
  supervisorSearch = undefined as
    | undefined
    | ((query: string) => Promise<unknown>),
  managerSearch = undefined as
    | undefined
    | ((query: string) => Promise<unknown>),
  createBySearch = undefined as
    | undefined
    | ((query: string) => Promise<unknown>),
  teamNameSearch = undefined as
    | undefined
    | ((query: string) => Promise<unknown>),
  enableHalthOptions = false,
} = {}) => {
  const fields: IFilterFormField[] = [
    {
      InputComponent: DateRangeWithType,
      inputProps: {
        name: isNewTeams ? 'date' : 'createTime',
        selectName: 'criteria',
        label: getString('text.selectDateType'),
        options: localeSelectDateType,
        isTeamPage: true,
        fixedLabel: true,
        filterType: 'summary',
        responsive: {
          xs: 6,
          md: 6,
        },
      },
      xs: 12,
      md: 12,
      lg: 12,
      xl: 6,
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'displayName',
        label: getString('text.teamName'),
        async: true,
        asyncFn: teamNameSearch ? undefined : TeamCloud.getTeamsBySortName,
        onFocusFn: teamNameSearch
          ? () =>
              teamNameSearch('').then(({ data }: any) => ({
                data: (
                  data?.teams as { name: string; displayName: string }[]
                ).map((x) => ({
                  id: x.name,
                  name: x.name,
                  displayName: x.displayName,
                })),
              }))
          : undefined,
        searchFn: teamNameSearch
          ? (query) =>
              teamNameSearch(query).then(({ data }: any) =>
                (data?.teams as { name: string; displayName: string }[]).map(
                  (x) => ({
                    id: x.name,
                    value: x.name,
                    displayName: x.displayName,
                  })
                )
              )
          : undefined,
        labelField: 'displayName',
        valueField: 'name',
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
        name: 'productType',
        label: getString('text.product'),
        options: localeProducts.filter(
          (option) => !(option.value !== initialProduct && !enableHalthOptions)
        ),
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 3,
        },
        testid: 'productType-filter-autocomplete',
      },
    },
    {
      InputComponent: LeadTypeMultiSelector,
      inputProps: {
        name: 'leadType',
        label: getString('text.leadType'),
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 3,
        },
        testid: 'leadType-filter-autocomplete',
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'manager',
        label: getString('text.manager'),
        lookup: true,
        async: true,
        asyncFn: managerSearch ? undefined : TeamCloud.lookupTeamManagers,
        searchFn: managerSearch
          ? (query) =>
              managerSearch(query).then(({ data }: any) =>
                (data as SearchUserResponse)?.users?.map((user) => ({
                  id: user.name,
                  value: user.name,
                  fullName: user.displayName,
                }))
              )
          : undefined,
        onFocusFn: managerSearch
          ? () =>
              managerSearch('').then(({ data }: any) => ({
                data: (data as SearchUserResponse)?.users?.map((user) => ({
                  id: user.name,
                  name: user.name,
                  fullName: user.displayName,
                })),
              }))
          : undefined,
        labelField: 'fullName',
        valueField: 'name',
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 3,
        },
        testid: 'manager-filter-autocomplete',
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'supervisor',
        label: getString('text.supervisor'),
        async: true,
        lookup: true,
        asyncFn: supervisorSearch ? undefined : TeamCloud.lookupTeamSupervisors,
        searchFn: supervisorSearch
          ? (query) =>
              supervisorSearch(query).then(({ data }: any) =>
                (data as SearchUserResponse)?.users?.map((user) => ({
                  id: user.name,
                  value: user.name,
                  fullName: user.displayName,
                }))
              )
          : undefined,
        onFocusFn: supervisorSearch
          ? () =>
              supervisorSearch('').then(({ data }: any) => ({
                data: (data as SearchUserResponse)?.users?.map((user) => ({
                  id: user.name,
                  name: user.name,
                  fullName: user.displayName,
                })),
              }))
          : undefined,
        labelField: 'fullName',
        valueField: 'name',
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 3,
        },
        testid: 'supervisor-filter-autocomplete',
      },
    },
    {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'createBy',
        label: getString('text.createBy'),
        async: true,
        lookup: true,
        asyncFn: createBySearch ? undefined : TeamCloud.getElasticsearchTeam,
        searchFn: createBySearch
          ? (query) =>
              createBySearch(query).then(({ data }: any) =>
                (data?.users as { name: string; displayName: string }[])?.map(
                  (x) => ({
                    id: x.name,
                    fullName: x.displayName,
                    value: x.name,
                  })
                )
              )
          : undefined,
        onFocusFn: createBySearch
          ? () =>
              createBySearch('').then(({ data }: any) => ({
                data: (
                  data?.users as { name: string; displayName: string }[]
                ).map((x) => ({
                  id: x.name,
                  fullName: x.displayName,
                  name: x.name,
                })),
              }))
          : undefined,
        multiple: false,
        labelField: 'fullName',
        valueField: 'name',
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 3,
        },
        filterDataField: 'role',
        filterDataValue: 'roles/admin',
        disableClearable: true,
        testid: 'create-by-autocomplete',
      },
    },
    {
      InputComponent: Controls.Slider,
      inputProps: {
        name: 'userCount',
        min: MIN_SLIDER,
        max: MAX_SLIDER,
        step: STEP_SLIDER,
        label: getString('text.userCount'),
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    },
  ];

  if (!hideTeamsInsurerFilter) {
    const insurerFiler: IFilterFormField = {
      InputComponent: Controls.Autocomplete,
      inputProps: {
        name: 'insurer',
        label: getString('text.insurer'),
        options: getInsurerOptionsByLanguage(),
        labelField: 'title',
        valueField: 'value',
        fixedLabel: true,
        filterType: 'detail',
        responsive: {
          xs: 6,
          md: 3,
        },
      },
    };
    fields.splice(6, 0, insurerFiler);
  }

  return fields;
};

export const initialValues = {
  createTime: {
    criteria: '',
    range: {
      startDate: null,
      endDate: null,
    },
  },
  date: {
    criteria: '',
    range: {
      startDate: null,
      endDate: null,
    },
  },
  displayName: [],
  productType: [],
  leadType: [],
  manager: [],
  supervisor: [],
  insurer: [],
  createBy: '',
  userCount: [0, 0],
};

export const fieldMapper: FilterMapType[] = [
  {
    filter: 'createBy',
    type: 'match',
    field: 'team.createBy',
    callback: (data: Record<string, string>) => data.value,
  },
  {
    filter: 'date',
    type: 'choiceDate',
    options: [
      { filter: 'createTime', field: 'team.createTime' },
      { filter: 'updateTime', field: 'team.updateTime' },
    ],
  },
  {
    filter: 'displayName',
    type: 'multi',
    field: 'team.name',
    callback: (leadType: Record<string, string>) => leadType.value,
  },
  {
    filter: 'leadType',
    type: 'multi',
    field: 'team.leadType',
    callback: (leadType: Record<string, string>) => leadType.value,
  },
  {
    filter: 'manager',
    type: 'multi',
    field: 'team.manager',
    callback: (leadType: Record<string, string>) => leadType.value,
  },
  {
    filter: 'productType',
    type: 'multi',
    field: 'team.productType.keyword',
    callback: (leadType: Record<string, string>) => leadType.value,
  },
  {
    filter: 'supervisor',
    type: 'multi',
    field: 'team.supervisor',
    callback: (leadType: Record<string, string>) => leadType.value,
  },
  {
    filter: 'userCount',
    type: 'range',
    field: 'team.memberCount',
  },
];

export const getFilterPanelQueryString = ({ filters }: { filters: any }) => {
  const filterStrings = [...buildFilter(filters, fieldMapper, [], false)];
  return filterStrings.join(' ');
};
