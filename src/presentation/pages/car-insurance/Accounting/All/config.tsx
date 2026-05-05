import SearchField from 'presentation/components/leads/searchField/SearchField';

import { Column } from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import Controls from 'presentation/components/controls/Control';

import { CancellationStatusOptions } from './helper';

export const PremiumRemittanceStatusOptions = [
  {
    key: 1,
    title: getString('text.rcl'),
    value: 'PREMIUM_STATUS_RCL',
  },
  {
    key: 2,
    title: getString('text.rcb'),
    value: 'PREMIUM_STATUS_RCB',
  },
  {
    key: 3,
    title: getString('carepay.contract.insurer'),
    value: 'PREMIUM_STATUS_INSURER',
  },
];

export const refundCalculationMethods = [
  {
    value: 'REFUND_CALCULATION_METHOD_PRO_RATA',
    label: 'Pro-Rata',
  },
  {
    value: 'REFUND_CALCULATION_METHOD_SHORT_RATE',
    label: 'Short-Rate',
  },
];

export const Columns: Column[] = [
  {
    id: 'id',
    label: 'text.orderItemId',
    minWidth: 160,
    field: 'item.humanId',
    sorting: 'none',
  },
  {
    id: 'policyNumber',
    label: 'tableListing.policyNumber',
    minWidth: 160,
    disabled: true,
    clickable: false,
  },
  {
    id: 'cancellationStatus',
    label: 'menu.accounting.cancellationStatus',
    minWidth: 160,
    disabled: true,
    clickable: false,
    field: 'status',
    transform: (data: any) =>
      getString(
        CancellationStatusOptions.find(
          (option) => option.value === data?.cancellationStatus
        )?.title ?? '-'
      ) || '-',
  },
  {
    id: 'premium',
    label: 'cancellation.premium',
    minWidth: 160,
    disabled: true,
    clickable: false,
  },
  {
    id: 'insuredPersonName',
    label: 'carepay.contract.insuredPersonName',
    minWidth: 160,
    disabled: true,
    clickable: false,
  },
  {
    id: 'licensePlate',
    label: 'leadDetailFields.licensePlate',
    minWidth: 160,
    disabled: true,
    clickable: false,
  },
  {
    id: 'chassisNumber',
    label: 'text.chassisNumber',
    minWidth: 160,
    disabled: true,
    clickable: false,
  },
  {
    id: 'orderCreateDate',
    label: 'text.orderCreatedDate',
    minWidth: 160,
    sorting: 'none',
    field: 'item.createTime',
  },
  {
    id: 'policyStartDate',
    label: 'dateTypeLeadOption.policyStartDate',
    minWidth: 160,
    sorting: 'none',
    field: 'item.policyStartDate',
  },
  {
    id: 'paymentPlan',
    label: 'cancellation.paymentPlan',
    minWidth: 160,
    disabled: true,
    clickable: false,
    transform: (data: any) =>
      data?.paymentPlan !== '-'
        ? getString(`paymentOptions.${data?.paymentPlan}`)
        : '-',
  },
  {
    id: 'paymentStatus',
    label: 'text.paymentStatus',
    minWidth: 160,
    field: 'status',
    disabled: true,
    clickable: false,
    transform: (data: any) =>
      data?.paymentStatus === true
        ? getString('tableListing.fullyPaid')
        : data?.paymentStatus === false
          ? getString('tableListing.notFullyPaid')
          : '-',
  },
  {
    id: 'premiumRemittanceStatus',
    label: 'cancellation.premiumRemittanceStatus',
    minWidth: 200,
    disabled: true,
    clickable: false,
    field: 'status',
    transform: (data: any) =>
      getString(
        PremiumRemittanceStatusOptions.find(
          (option) => option.value === data?.premiumRemittanceStatus
        )?.title ?? '-'
      ) || '-',
  },
  {
    id: 'actualPremiumRemittanceAmountToRCB',
    label: 'text.actualPremiumRemittanceAmountToRCB',
    minWidth: 200,
    disabled: true,
    clickable: false,
  },
  {
    id: 'premiumRemittanceDateToRCB',
    label: 'text.premiumRemittanceDateToRCB',
    minWidth: 200,
    clickable: false,
    sorting: 'none',
    field: 'accounting.remittanceRcbTime',
  },
  {
    id: 'actualPremiumRemittanceAmountToInsurer',
    label: 'text.actualPremiumRemittanceAmountToInsurer',
    minWidth: 200,
    disabled: true,
    clickable: false,
  },
  {
    id: 'premiumRemittanceDateToInsurer',
    label: 'text.premiumRemittanceDateToInsurer',
    minWidth: 200,
    clickable: false,
    sorting: 'none',
    field: 'accounting.remittanceInsurerTime',
  },
  {
    id: 'premiumReturnStatus',
    label: 'cancellation.premiumReturnStatus',
    minWidth: 160,
    disabled: true,
    clickable: false,
    transform: (data: any) =>
      PremiumRemittanceStatusOptions.find(
        (option) => option.value === data?.premiumReturnStatus
      )?.title || '-',
  },
  {
    id: 'latestPremiumReturnStatusDate',
    minWidth: 200,
    label: 'cancellation.latestPremiumReturnStatusDate',
    sorting: 'none',
    disabled: true,
    field: 'latestPremiumReturnStatusDate',
  },
  {
    id: 'latestPremiumRemittanceStatusDate',
    minWidth: 200,
    label: 'cancellation.latestPremiumRemittanceStatusDate',
    sorting: 'none',
    disabled: true,
    field: 'latestPremiumRemittanceStatusDate',
  },
  {
    id: 'actualReturnAmountFromInsurer',
    label: 'text.actualReturnAmountFromInsurer',
    minWidth: 200,
    disabled: true,
    clickable: false,
  },
  {
    id: 'premiumReturnDateFromInsurer',
    label: 'text.premiumReturnDateFromInsurer',
    minWidth: 200,
    clickable: false,
    field: 'accounting.returnInsurerTime',
    sorting: 'none',
  },
  {
    id: 'actualReturnAmountFromRCB',
    label: 'text.actualReturnAmountFromRCB',
    minWidth: 200,
    disabled: true,
    clickable: false,
  },
  {
    id: 'premiumReturnDateFromRCB',
    label: 'text.premiumReturnDateFromRCB',
    minWidth: 200,
    field: 'accounting.returnRcbTime',
    clickable: false,
    sorting: 'none',
  },
  {
    id: 'policyEndDate',
    label: 'cancellation.policyEndDate',
    minWidth: 160,
    field: 'accounting.policyEndTime',
    clickable: false,
    sorting: 'none',
  },
  {
    id: 'refundCalculationMethod',
    label: 'cancellation.refundCalculationMethod',
    minWidth: 200,
    disabled: true,
    clickable: false,
    transform: (data: any) =>
      refundCalculationMethods.find(
        (method) => method.value === data?.refundCalculationMethod
      )?.label || '-',
  },
  {
    id: 'refundAmountFromInsurer',
    label: 'cancellation.refundAmountFromInsurer',
    minWidth: 200,
    clickable: false,
    sorting: 'none',
    field: 'accounting.refundInsurerAmount.units',
  },
  {
    id: 'commissionClawback',
    label: 'text.commissionClawback',
    minWidth: 160,
    disabled: true,
    clickable: false,
  },
  {
    id: 'refundAmountToCustomer',
    label: 'cancellation.refundAmountToCustomer',
    minWidth: 160,
    sorting: 'none',
    field: 'accounting.refundAmountCustomer.units',
  },
  {
    id: 'actualRefundAmountToCustomer',
    label: 'text.actualRefundAmountToCustomer',
    minWidth: 200,
    disabled: true,
    clickable: false,
  },
  {
    id: 'refundDate',
    label: 'cancellation.refundDate',
    minWidth: 160,
    sorting: 'none',
    field: 'accounting.refundCustomerTime',
  },
];

export const SearchOptions = [
  {
    key: 2,
    title: getString('leadDetailFields.orderId'),
    value: 'orderId',
  },
  {
    key: 3,
    title: getString('text.orderItemId'),
    value: 'orderItemId',
  },
  {
    key: 4,
    title: getString('searchFieldPrintingAndShippingOption.policyHolderName'),
    value: 'insuredPersonName',
  },
  {
    key: 5,
    title: getString('searchFieldLeadOption.licensePlate'),
    value: 'licensePlate',
  },
  {
    key: 7,
    title: getString('text.chassisNumber'),
    value: 'chassisNumber',
  },
];
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
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'premiumRemittanceStatus',
      label: getString('cancellation.premiumRemittanceStatus'),
      placeholder: getString('cancellation.premiumRemittanceStatus'),
      options: PremiumRemittanceStatusOptions,
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
      name: 'premiumReturnStatus',
      label: getString('cancellation.premiumReturnStatus'),
      placeholder: getString('cancellation.premiumReturnStatus'),
      options: PremiumRemittanceStatusOptions,
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
      name: 'cancellationStatus',
      label: getString('menu.accounting.cancellationStatus'),
      placeholder: getString('text.select'),
      options: CancellationStatusOptions.map((opt) => ({
        ...opt,
        title:
          opt.title === 'cancellation.completed'
            ? getString('documentStatus.complete')
            : opt.title,
      })),
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
];
