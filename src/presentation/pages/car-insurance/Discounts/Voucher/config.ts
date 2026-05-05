import * as Yup from 'yup';

import Controls from 'presentation/components/controls/Control';
import MultiDateRangeWithType from 'presentation/components/controls/MultiDateRangeWithType';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import SearchField from 'presentation/components/leads/searchField/SearchField2';
import { Column } from 'presentation/HOCs/WithTableList';
import { getString } from 'presentation/theme/localization';

export const columns: Column[] = [
  {
    id: 'humanName',
    field: 'humanName',
    label: 'lead.tableListing.name',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'code',
    field: 'code',
    label: 'menu.discounts.voucherCode',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'voucherType',
    field: 'voucherType',
    label: 'menu.discounts.voucherType',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'price',
    field: 'price',
    label: 'menu.discounts.voucherPrice',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'percentDiscount',
    field: 'percentDiscount',
    label: 'menu.discounts.discountPercent',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'quantity',
    field: 'quantity',
    label: 'menu.discounts.voucherQuantity',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'startTime',
    field: 'startTime',
    label: 'text.startDate',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'endTime',
    field: 'endTime',
    label: 'text.endDate',
    minWidth: 100,
    sorting: 'none',
    disabled: true,
  },
];
export const VoucherTypeOptions = [
  { key: 0, title: getString('text.percent'), value: 'percent' },
  { key: 1, title: getString('text.cash'), value: 'cash' },
];
export const VoucherSearchOptions = [
  {
    key: 0,
    title: getString('text.select'),
    value: '',
  },
  {
    key: 1,
    title: getString('menu.discounts.voucherName'),
    value: 'humanName',
  },
  {
    key: 2,
    title: getString('menu.discounts.voucherCode'),
    value: 'code',
  },
];
export const InitialValuesOfFilter = {
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
  voucherType: '',
  price: null,
  percentDiscount: null,
};

export const fields: IFilterFormField[] = [
  {
    InputComponent: SearchField,
    inputProps: {
      name: 'search',
      label: getString('text.search'),
      searchOption: VoucherSearchOptions,
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
    InputComponent: Controls.Select,
    inputProps: {
      value: '',
      name: 'voucherType',
      label: getString('menu.discounts.voucherType'),
      options: VoucherTypeOptions,
      filterType: 'summary',
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
      value: '',
      name: 'date',
      label: getString('text.selectDateType'),
      options: [
        { id: 1, title: getString('text.select'), value: '' },
        { id: 2, title: getString('text.startDate'), value: 'startTime' },
        { id: 3, title: getString('text.endDate'), value: 'endTime' },
      ],
      filterType: 'detail',
      selectField: 'value',
      fixedLabel: true,
      placeholder: getString('text.selectDateType'),
      responsive: {
        xs: 6,
        md: 9,
      },
    },
  },
];

export const CreateVoucherSchema = () =>
  Yup.lazy((values) => {
    const defaultSchema: any = {
      humanName: Yup.string().required(getString('errors.requiredFormField')),
      startTime: Yup.string().required(getString('errors.requiredDate')),
      endTime: Yup.string().required(getString('errors.requiredDate')),
      code: Yup.string().required(getString('errors.requiredFormField')),
      quantity: Yup.number()
        .nullable()
        .required(getString('errors.requiredFormField')),
      percentDiscount: Yup.number()
        .nullable()
        .required(getString('errors.requiredFormField')),
      price: Yup.number()
        .nullable()
        .required(getString('errors.requiredFormField')),
    };

    if (values.voucherType === 'percent') {
      delete defaultSchema.price;
    } else {
      delete defaultSchema.percentDiscount;
    }

    return Yup.object().shape(defaultSchema);
  });
