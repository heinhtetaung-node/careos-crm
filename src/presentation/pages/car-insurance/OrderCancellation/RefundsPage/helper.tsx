import Controls from 'presentation/components/controls/Control';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import { getString } from 'presentation/theme/localization';
import { bankLists, refundProviderOptions } from '../All/helper';
import ProductOptions from 'shared/constants/productOptions';
import {
  buildFilter,
  FilterMapType,
} from 'data/gateway/api/resource/leadSearch';
import { PaymentMethodOptions } from '../../CarePay/common/helper';
import { Column } from 'presentation/hooks/useTableList';
import SearchField from 'presentation/components/leads/searchField/SearchField';
import { formatE164 } from 'shared/helper/utilities';
import React from 'react';
import { getUserRoleAccessLead } from 'utils/userRolesAccess';
import { UpdateRefundStatusButton } from './UpdateRefundStatusButton';

export const RefundStatusOptions = [
  {
    id: 1,
    title: getString('carepay.refundStatus.pending'),
    value: 'PENDING',
  },
  {
    id: 2,
    title: getString('carepay.refundStatus.processing'),
    value: 'PROCESSING',
  },
  {
    id: 3,
    title: getString('carepay.refundStatus.successful'),
    value: 'SUCCESSFUL',
  },
  { id: 4, title: getString('carepay.refundStatus.failed'), value: 'FAILED' },
];

export const tableColumns = (role: string): Column[] => [
  ...(getUserRoleAccessLead(role).canUpdateRefundStatus
    ? [
        {
          id: 'updateRefundStatus',
          field: 'updateRefundStatus',
          label: '',
          minWidth: 30,
          clickable: true,
          disabled: true,
          customField: true,
          transform: (rowData: any) => (
            <UpdateRefundStatusButton rowData={rowData} />
          ),
        },
      ]
    : []),
  {
    id: 'id',
    field: 'refund.humanId',
    label: 'text.refundID',
    minWidth: 140,
    sorting: 'desc',
    align: 'left',
  },
  {
    id: 'productType',
    field: 'attributes.product',
    label: 'text.productType',
    minWidth: 150,
    sorting: 'none',
    transform: ({ productType }: any) =>
      getString(
        ProductOptions.find((option) => option.value === productType)?.title ??
          '-'
      ),
  },
  {
    id: 'orderId',
    field: 'attributes.orderHumanId',
    label: 'text.orderId',
    minWidth: 140,
    sorting: 'none',
  },
  {
    id: 'orderItemId',
    field: 'attributes.orderItemHumanId',
    label: 'text.orderItemId',
    minWidth: 180,
    sorting: 'none',
  },
  {
    id: 'customerFullName',
    field: 'attributes.customerFullName',
    label: 'menu.carePay.customerName',
    minWidth: 180,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'customerPhone',
    field: 'attributes.customerPhone',
    label: 'menu.carePay.customerPhone',
    minWidth: 150,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'refundAmount',
    field: 'refund.money.amount',
    label: 'text.refundAmount',
    minWidth: 130,
    sorting: 'none',
  },
  {
    id: 'refundMethod',
    field: 'refund.paymentMethod',
    label: 'text.refundMethod',
    minWidth: 180,
    sorting: 'none',
    transform: ({ refundMethod }: any) =>
      getString(`paymentMethodsCarepay.${refundMethod}`),
  },
  {
    id: 'bankName',
    field: 'refund.bank',
    label: 'text.bankName',
    minWidth: 200,
    sorting: 'none',
    transform: ({ bankName }: any) =>
      bankLists.find((b) => b.name === bankName)?.label || '-',
  },
  {
    id: 'bankAccountNumber',
    field: 'bank.bankAccountNumber',
    label: 'text.bankAccountNumber',
    minWidth: 180,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'status',
    field: 'refund.status',
    label: 'text.status',
    minWidth: 120,
    sorting: 'none',
    transform: ({ status }: any) =>
      getString(`carepay.refundStatus.${status.toLowerCase()}`),
  },
  {
    id: 'processedAt',
    field: 'refund.refundDate',
    label: 'dateType.processedAt',
    minWidth: 220,
    sorting: 'none',
  },
  {
    id: 'createdAt',
    field: 'refund.createTime',
    label: 'dateType.createdAt',
    minWidth: 220,
    sorting: 'none',
  },
  {
    id: 'updatedAt',
    field: 'refund.updateTime',
    label: 'dateType.updatedAt',
    minWidth: 220,
    sorting: 'none',
  },
];

export const filterInput = (
  name: string,
  label: string,
  placeholder: string,
  type: 'input' | 'autocomplete' = 'input',
  options?: any[],
  responsive: any = { md: 3 },
  multiple: boolean = true
) => ({
  InputComponent: type === 'input' ? Controls.Input : Controls.Autocomplete,
  inputProps: {
    name,
    label: getString(label),
    placeholder,
    multiple,
    fixedLabel: true,
    filterType: 'summary',
    responsive,
    ...(type === 'autocomplete' && options ? { options } : {}),
    ...(type === 'autocomplete' &&
      options && { limitTags: 3, hasExpand: true }),
  },
});

export const SearchOptions = [
  {
    key: 2,
    title: getString('text.refundID'),
    value: 'refund.humanId',
  },
  {
    key: 3,
    title: getString('text.orderId'),
    value: 'attributes.orderHumanId',
  },
  {
    key: 4,
    title: getString('text.orderItemId'),
    value: 'attributes.orderItemHumanId',
  },
  {
    key: 5,
    title: getString('menu.carePay.customerName'),
    value: 'attributes.customerFullName',
  },
  {
    key: 5,
    title: getString('menu.carePay.customerPhone'),
    value: 'attributes.customerPhone.keyword',
  },
  {
    key: 7,
    title: getString('text.bankAccountNumber'),
    value: 'refund.bankAccountNumber',
  },
];

export const filterFields: IFilterFormField[] = [
  {
    InputComponent: SearchField,
    inputProps: {
      name: 'search',
      label: getString('text.search'),
      searchOption: SearchOptions,
      fixedLabel: true,
      filterType: 'summary',
      placeholder: getString('text.select'),
      responsive: {
        md: 6,
      },
    },
  },
  filterInput(
    'bankName',
    'text.bankName',
    '',
    'autocomplete',
    bankLists.map((bank) => ({
      id: bank.name,
      title: bank.label,
      value: bank.name,
    })),
    { md: 3 }
  ),
  filterInput(
    'productType',
    'text.productType',
    '',
    'autocomplete',
    ProductOptions
  ),
  filterInput(
    'refundProvider',
    'cancellation.popup.refundServiceProviderTitle',
    '',
    'autocomplete',
    refundProviderOptions
  ),
  filterInput(
    'refundMethod',
    'text.refundMethod',
    '',
    'autocomplete',
    PaymentMethodOptions
  ),
  filterInput('status', 'text.status', '', 'autocomplete', RefundStatusOptions),
];

export const matchField = (filter: string, field: string) => ({
  filter,
  type: 'match',
  field,
  callback: (data: Record<string, string>) => data.value,
});

export const multiField = (filter: string, field: string) => ({
  filter,
  type: 'multi',
  field,
  callback: (data: Record<string, string>) => data.value,
});

export const fieldMapper: FilterMapType[] = [
  matchField('refundAmount', 'refund.money.amount'),
  multiField('refundMethod', 'refund.paymentMethod'),
  multiField('refundProvider', 'refund.serviceProvider'),
  multiField('bankName', 'refund.bank'),
  multiField('productType', 'attributes.product'),
  multiField('status', 'refund.status'),
  matchField('processedAt', 'refund.refundDate'),
  matchField('createdAt', 'refund.createTime'),
  matchField('updatedAt', 'refund.updateTime'),
];

export const getFilterPanelQueryString = ({ filters }: { filters: any }) => {
  let currentFieldMappers = [...fieldMapper];
  const customFilters = { ...filters };

  if (customFilters?.search?.selectValue) {
    const { selectValue } = customFilters.search;

    if (selectValue === 'attributes.customerPhone.keyword') {
      const formattedPhoneNumber = formatE164(customFilters.search.inputValue);
      customFilters.search = {
        attributes: { customerPhone: { keyword: formattedPhoneNumber } },
        inputValue: formattedPhoneNumber,
        selectValue: 'attributes.customerPhone.keyword',
      };
    }

    currentFieldMappers = currentFieldMappers.filter(
      (item) => item.filter !== 'search.inputValue'
    );

    currentFieldMappers.push({
      filter: 'search.inputValue',
      type: selectValue === 'attributes.customerFullName' ? 'contain' : 'match',
      field: selectValue,
      callback: (data: Record<string, string>) => data.value,
    });
  }

  const filterStrings = [
    ...buildFilter(customFilters, currentFieldMappers, [], false),
  ];
  return filterStrings.join(' ');
};
