import Controls from 'presentation/components/controls/Control';
import MultiDateRangeWithType from 'presentation/components/controls/MultiDateRangeWithType';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import SearchField from 'presentation/components/leads/searchField/SearchField2';
import { Column } from 'presentation/HOCs/WithTableList';
import { getString } from 'presentation/theme/localization';

export const columns: Column[] = [
  {
    id: 'campaignCode',
    field: 'campaignCode',
    label: 'menu.discounts.campaignName',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
    tooltipId: 'description', // description column to show as tooltip
  },
  {
    id: 'discountPercentage',
    field: 'discountPercentage',
    label: 'menu.discounts.discountPercent',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'startDate',
    field: 'startDate',
    label: 'text.startDate',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'endDate',
    field: 'endDate',
    label: 'text.endDate',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'approver',
    field: 'approver',
    label: 'text.approver',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
];

export const InitialValuesOfFilter = {
  search: { key: '', value: '' },
  discountPercentage: [0, 0],
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
  approver: '',
};
export const CampaignSearchOptions = [
  {
    key: 0,
    title: getString('text.select'),
    value: '',
  },
  {
    key: 2,
    title: getString('menu.discounts.campaignName'),
    value: 'campaignCode',
  },
];

export const ApproverOptions = [
  {
    key: 0,
    title: getString('text.select'),
    value: '-',
  },
  {
    key: 1,
    title: getString('text.noApprover'),
    value: '',
  },
  {
    key: 2,
    title: getString('text.manager'),
    value: 'roles/manager',
  },
  {
    key: 3,
    title: getString('text.supervisor'),
    value: 'roles/supervisor',
  },
];

export const fields: IFilterFormField[] = [
  {
    InputComponent: SearchField,
    inputProps: {
      name: 'search',
      label: getString('text.search'),
      searchOption: CampaignSearchOptions,
      fixedLabel: true,
      filterType: 'summary',
      placeholder: getString('text.select'),
      responsive: {
        xs: 6,
        md: 6,
      },
    },
  },
  {
    InputComponent: Controls.Slider,
    inputProps: {
      name: 'discountPercentage',
      label: getString('menu.discounts.rangePercentDiscount'),
      min: 1,
      max: 100,
      step: 0.5,
      marks: false,
      isPlaceHolder: false,
      filterType: 'summary',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  {
    InputComponent: Controls.Select,
    inputProps: {
      value: '',
      name: 'approver',
      label: getString('text.approver'),
      options: ApproverOptions,
      filterType: 'detail',
      selectField: 'value',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  {
    InputComponent: MultiDateRangeWithType,
    inputProps: {
      name: 'date',
      label: getString('menu.discounts.campaignPeriod'),
      isPlaceHolder: false,
      options: [
        { id: 1, title: getString('text.select'), value: '' },
        { id: 2, title: getString('text.startDate'), value: 'startDate' },
        { id: 3, title: getString('text.endDate'), value: 'endDate' },
      ],
      filterType: 'detail',
      selectField: 'value',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 9,
      },
    },
  },
];
