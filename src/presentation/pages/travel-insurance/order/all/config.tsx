import React from 'react';
import clsx from 'clsx';

import { Button } from '@alphafounders/ui';
import { EmailRounded } from '@alphafounders/icons';

import MultiDateRangeWithType from 'presentation/components/controls/MultiDateRangeWithType';
import Controls from 'presentation/components/controls/Control';
import SearchField from 'presentation/components/leads/searchField/SearchField2';

import { approvalStatusOptions } from 'shared/constants/ordersAllSearchFields';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import { Column } from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import { getUserRoleAccess } from 'presentation/pages/car-insurance/CarePay/common/helper';
import { UserRoles } from 'config/constant';

import {
  DestinationCountryOptions,
  InsuranceCompanyOptions,
  OrderDateTypeOptions,
  SearchOptions,
  TravelTypeOptions,
} from './helper';
import { ItemApprovalStatus } from 'shared/constants/orderType';

export const fields: IFilterFormField[] = [
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
        xs: 6,
        md: 6,
      },
    },
  },
  {
    InputComponent: MultiDateRangeWithType,
    inputProps: {
      name: 'date',
      options: OrderDateTypeOptions,
      label: '',
      value: '',
      filterType: 'detail',
      responsive: {
        xs: 12,
        md: 12,
      },
    },
  },
  {
    InputComponent: Controls.Select,
    inputProps: {
      name: 'insuranceCompany',
      label: getString('tableListing.insuranceCompany'),
      placeholder: getString('text.select'),
      options: InsuranceCompanyOptions,
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
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'approvalStatus',
      label: getString('text.approvalStatus'),
      placeholder: getString('text.select'),
      options: approvalStatusOptions
        .filter(
          (opt) =>
            ![
              ItemApprovalStatus.REJECTED,
              ItemApprovalStatus.SUBMISSION_PROBLEM,
            ].includes(opt.value)
        )
        .map((opt) => ({
          ...opt,
          title: getString(opt.title),
        })),
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
    InputComponent: Controls.Select,
    inputProps: {
      name: 'travelType',
      label: getString('text.travelType'),
      placeholder: getString('text.select'),
      options: TravelTypeOptions,
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
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'destinationCountry',
      label: getString('travel.destinationCountry'),
      placeholder: getString('text.select'),
      options: DestinationCountryOptions,
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
    InputComponent: Controls.Checkbox,
    inputProps: {
      name: 'isCancelled',
      label: getString('text.showCancelled'),
      filterType: 'detail',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
];

export const getColumns: (
  role: UserRoles,
  handleEdit: (data: any) => void
) => Column[] = (role, handleEdit) => {
  const { canSendPolicyEmail } = getUserRoleAccess(role);
  return [
    {
      id: 'policyEmail',
      label: 'travel.sendPolicyEmail',
      minWidth: 160,
      disabled: true,
      clickable: true,
      customField: true,
      transform: (data: any) => (
        <Button
          onClick={() =>
            handleEdit({
              ...data,
              type: 'send-policy-email',
              show: true,
            })
          }
          icon={<EmailRounded fillColor="white" />}
          disabled={!canSendPolicyEmail}
          rounded
          text=""
          className={clsx('p-2', {
            'opacity-65': !canSendPolicyEmail,
          })}
        />
      ),
    },
    {
      id: 'orderId',
      field: 'order.humanId',
      label: 'text.orderId',
      sorting: 'asc',
      minWidth: 160,
      disabled: false,
      clickable: true,
      customField: true,
      transform: (data: any) => (
        <div className="flex flex-col items-start">
          <span>{data.orderId}</span>
          {data.isCancelled && (
            <span className="p-1 px-2 bg-rose-600 text-white text-[10px] !rounded-[50px] mt-2">
              {getString('text.cancelled')}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'insurancePackage',
      label: 'text.insurancePackage',
      minWidth: 160,
      disabled: true,
      clickable: true,
      customField: true,
      transform: (data: any) => (
        <span className="">{data.insurancePackage}</span>
      ),
    },
    {
      id: 'travelType',
      field: 'order.data.policy.travelPlan',
      label: 'text.travelType',
      minWidth: 160,
    },
    {
      id: 'companyName',
      label: 'tableListing.insuranceCompany',
      disabled: true,
      minWidth: 160,
    },
    {
      id: 'customer',
      field: 'order.data.customer.firstName',
      disabled: true,
      label: 'foreignLead.customer',
      minWidth: 160,
    },
    {
      id: 'totalInvoiced',
      field: 'order.invoicePrice',
      label: 'tableListing.totalInvoiced',
      sorting: 'none',
      minWidth: 160,
    },
    {
      id: 'phoneNumber',
      disabled: true,
      label: 'text.phoneNumber',
      minWidth: 160,
    },
    {
      id: 'email',
      label: 'text.email',
      disabled: true,
      minWidth: 160,
    },
    {
      id: 'destinationCountry',
      field: 'order.data.trip.destinations',
      label: 'travel.destinationCountry',
      minWidth: 160,
    },
    {
      id: 'startDate',
      label: 'travel.startDate',
      field: 'order.data.trip.startDate',
      sorting: 'none',
      minWidth: 160,
    },
    {
      id: 'endDate',
      label: 'travel.endDate',
      field: 'order.data.trip.endDate',
      sorting: 'none',
      minWidth: 160,
    },
    {
      id: 'duration',
      label: 'text.duration.days',
      field: 'order.data.trip.durationInDays',
      sorting: 'none',
      minWidth: 160,
    },
    {
      id: 'orderCreated',
      label: 'tableListing.orderCreated',
      field: 'order.createTime',
      sorting: 'none',
      minWidth: 160,
    },
    {
      id: 'orderUpdated',
      label: 'tableListing.orderUpdated',
      field: 'order.updateTime',
      sorting: 'none',
      minWidth: 160,
    },
    {
      id: 'lastDeliveredByEmail',
      label: 'travel.lastDeliveredByEmail',
      disabled: true,
      sorting: 'none',
      minWidth: 160,
    },
  ];
};
