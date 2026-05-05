import {
  EditIcon,
  EmailRounded,
  FileReject,
  SlipIcon,
  TrashIconRounded,
} from '@alphafounders/icons';
import CommentIcon from '@material-ui/icons/Comment';

import camelCase from 'lodash/camelCase';
import React from 'react';
import SearchField from 'presentation/components/leads/searchField/SearchField';

import { Column } from 'presentation/hooks/useTableList';
import { getString } from 'presentation/theme/localization';
import Controls from 'presentation/components/controls/Control';
import { CommonSelectOption } from 'shared/types/lead';
import { PRODUCTS } from 'config/TypeFilter';
import sortParams from '../../orders/table.helper';

import {
  buildFilter,
  getQueryParts,
} from 'data/gateway/api/resource/leadSearch';
import {
  filterMapOrderCancellation,
  getFilter,
} from 'data/gateway/api/resource/order';
import { RefundIcon } from 'presentation/components/icons';
import MultiDateRangeWithType from 'presentation/components/controls/MultiDateRangeWithType';
import { ProductTypeOptions } from 'presentation/components/modal/UserModal/helper';
import { PaymentTypeOptions } from '../../CarePay/common/helper';
import {
  PremiumRemittanceStatusOptions,
  refundCalculationMethods,
  SearchOptions,
} from '../../Accounting/All/config';
import { uploadDocumentViaDocumentService } from '@careos/utils';
import clsx from 'clsx';
import { getInsurersList } from '../../orders/filter.helper';
import { CancellationStatusOptions } from '../../Accounting/All/helper';

export enum TabIds {
  PENDING_ON_CUSTOMER = 'pending-on-customer',
  PENDING_CONFIRMATION_ON_CUSTOMER = 'pending-confirmation-on-customer',
  PENDING_POLICY_RETURN = 'pending-policy-return',
  PENDING_CANCEL_SUBMITSSION = 'pending-cancel-submission',
  PENDING_CANCEL_CONFIRMATION_SUBMITSSION = 'pending-cancel-confirmation-submission',
  PENDING_REFUND = 'pending-refund',
  COMPLETED = 'completed',
}

export const TabIdsWithStatusMapping = {
  [TabIds.PENDING_ON_CUSTOMER]: 'CANCELLATION_STATUS_CUSTOMER_CONTACT',
  [TabIds.PENDING_CONFIRMATION_ON_CUSTOMER]:
    'CANCELLATION_STATUS_CUSTOMER_CONFIRM',
  [TabIds.PENDING_POLICY_RETURN]: 'CANCELLATION_STATUS_CUSTOMER_POLICY_RETURN',
  [TabIds.PENDING_CANCEL_SUBMITSSION]: 'CANCELLATION_STATUS_INSURER_CONTACT',
  [TabIds.PENDING_CANCEL_CONFIRMATION_SUBMITSSION]:
    'CANCELLATION_STATUS_INSURER_CONFIRM',
  [TabIds.PENDING_REFUND]: 'CANCELLATION_STATUS_CUSTOMER_REFUND',
  [TabIds.COMPLETED]: 'CANCELLATION_STATUS_COMPLETED',
};

export const urgentRefundReasonOptions = [
  {
    key: 1,
    title: getString('text.customerComplaint'),
    value: 'CUSTOMER_COMPLAINT',
  },
  {
    key: 2,
    title: getString('text.customerNeedsMoneyToBuyNewInsurance'),
    value: 'CUSTOMER_NEEDS_MONEY_TO_BUY_NEW_INSURANCE',
  },
];

export const bankLists = [
  {
    value: 'SCB',
    label: getString('cancellation.banks.SCB'),
    name: 'banks/18',
  },
  { value: 'KTB', label: getString('cancellation.banks.KTB'), name: 'banks/2' },
  {
    value: 'BBL',
    label: getString('cancellation.banks.BBL'),
    name: 'banks/20',
  },
  {
    value: 'KBANK',
    label: getString('cancellation.banks.KBANK'),
    name: 'banks/19',
  },
  { value: 'TMB', label: getString('cancellation.banks.TMB'), name: 'banks/3' },
  { value: 'BAY', label: getString('cancellation.banks.BAY'), name: 'banks/4' },
  { value: 'UOB', label: getString('cancellation.banks.UOB'), name: 'banks/5' },
  {
    value: 'CIMB',
    label: getString('cancellation.banks.CIMB'),
    name: 'banks/6',
  },
  {
    value: 'TISCO',
    label: getString('cancellation.banks.TISCO'),
    name: 'banks/7',
  },
  {
    value: 'TBANK',
    label: getString('cancellation.banks.TBANK'),
    name: 'banks/8',
  },
  { value: 'GSB', label: getString('cancellation.banks.GSB'), name: 'banks/9' },
  { value: 'LH', label: getString('cancellation.banks.LH'), name: 'banks/10' },
  {
    value: 'KKP',
    label: getString('cancellation.banks.KKP'),
    name: 'banks/11',
  },
  {
    value: 'ICBC',
    label: getString('cancellation.banks.ICBC'),
    name: 'banks/12',
  },
  {
    value: 'HSBC',
    label: getString('cancellation.banks.HSBC'),
    name: 'banks/13',
  },
  {
    value: 'TCD',
    label: getString('cancellation.banks.TCD'),
    name: 'banks/14',
  },
  {
    value: 'BAAC',
    label: getString('cancellation.banks.BAAC'),
    name: 'banks/15',
  },
  {
    value: 'EXIM',
    label: getString('cancellation.banks.EXIM'),
    name: 'banks/16',
  },
  {
    value: 'IFS',
    label: getString('cancellation.banks.IFS'),
    name: 'banks/17',
  },
  { value: 'OUB', label: getString('cancellation.banks.OUB'), name: 'banks/1' },
];

export const getFields = () => [
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
        xs: 3,
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
        xs: 3,
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
        xs: 3,
      },
    },
  },
];

export const customerRequestOptions = [
  {
    key: 1,
    title: getString('text.refund'),
    value: 'CUSTOMER_REQUEST_REFUND',
  },
  {
    key: 2,
    title: getString('cancellation.changeOrder'),
    value: 'CUSTOMER_REQUEST_CHANGE_ORDER',
  },
];

export const getFieldsV2 = () => [
  {
    InputComponent: SearchField,
    inputProps: {
      name: 'search',
      label: getString('text.search'),
      searchOption: [
        ...SearchOptions,
        {
          key: 8,
          title: getString('tableListing.leadForChangeOrder'),
          value: 'leadForChangeOrder',
        },
      ],
      fixedLabel: true,
      filterType: 'summary',
      placeholder: getString('text.select'),
      responsive: {
        xs: 3,
      },
    },
  },
  {
    InputComponent: (params: any) => (
      <MultiDateRangeWithType
        {...params}
        options={[
          {
            id: 1,
            title: 'Select',
            value: '',
          },
          {
            id: 6,
            title: getString('cancellation.orderCancelledOn'),
            value: 'item.cancelTime',
          },
          {
            id: 7,
            title: getString('tableListing.orderCreated'),
            value: 'item.createTime',
          },
          {
            id: 8,
            title: getString('tableListing.policyStartDate'),
            value: 'item.policyStartDate',
          },
          {
            id: 9,
            title: getString('menu.carePay.updateDate'),
            value: 'accounting.updateTime',
          },
        ]}
      />
    ),
    inputProps: {
      name: 'date',
      label: '',
      value: '',
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 9,
      },
      hasExpand: true,
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'productType',
      label: getString('tableListing.productType'),
      placeholder: getString('tableListing.productType'),
      options: ProductTypeOptions,
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 3,
      },
    },
  },
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'insurer',
      label: getString('qc.insurer'),
      placeholder: getString('text.select'),
      async: true,
      asyncFn: () =>
        getInsurersList({
          pageSize: 1000,
        }),
      paginate: true,
      labelField: 'displayName',
      valueField: 'name',
      filterType: 'summary',
      selectField: 'value',
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
      name: 'customerRequest',
      label: getString('tableListing.customerRequest'),
      placeholder: getString('tableListing.customerRequest'),
      options: customerRequestOptions,
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 3,
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
  {
    InputComponent: Controls.Slider,
    inputProps: {
      name: 'refundAmountFromInsurer',
      label: getString('cancellation.refundAmountFromInsurer'),
      min: 0,
      max: 100000,
      step: 1,
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
  // {
  //   InputComponent: Controls.Slider,
  //   inputProps: {
  //     name: 'availableCreditShell',
  //     label: getString('tableListing.availableCreditShell'),
  //     min: 0,
  //     max: 100000,
  //     step: 1,
  //     marks: false,
  //     isPlaceHolder: false,
  //     filterType: 'summary',
  //     fixedLabel: true,
  //     responsive: {
  //       xs: 6,
  //       md: 3,
  //     },
  //   },
  // },
  {
    InputComponent: Controls.Slider,
    inputProps: {
      name: 'refundAmountToCustomer',
      label: getString('cancellation.refundAmountToCustomer'),
      min: 0,
      max: 100000,
      step: 1,
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
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'paymentOption',
      label: getString('newPackageListing.paymentPlan'),
      options: PaymentTypeOptions,
      filterType: 'summary',
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
      name: 'paymentStatus',
      label: getString('menu.carePay.paymentStatus'),
      options: [
        {
          key: 1,
          title: getString('tableListing.fullyPaid'),
          value: true,
        },
        {
          key: 2,
          title: getString('tableListing.notFullyPaid'),
          value: false,
        },
      ],
      filterType: 'summary',
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
      name: 'urgentRefund',
      label: getString('cancellation.urgentRefund'),
      placeholder: getString('cancellation.urgentRefund'),
      options: [
        {
          key: 1,
          title: getString('text.yes'),
          value: true,
        },
        {
          key: 2,
          title: getString('text.no'),
          value: false,
        },
      ],
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
      name: 'urgentRefundReason',
      label: getString('cancellation.urgentRefundReason'),
      placeholder: getString('cancellation.urgentRefundReason'),
      options: urgentRefundReasonOptions,
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  {
    InputComponent: Controls.NumberInput,
    inputProps: {
      className: 'hidden',
      name: 'hidden',
      label: getString('cancellation.urgentRefundReason'),
      placeholder: getString('cancellation.urgentRefundReason'),
      options: urgentRefundReasonOptions,
      fixedLabel: true,
      filterType: 'summary',
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
];

export const tabConfig = Object.values(TabIds).map((value) => ({
  id: value,
  title: getString(`cancellation.${camelCase(value)}`),
}));
const commonIconClass =
  'flex items-center justify-center border-solid cursor-pointer w-min p-1 bg-primary border-none rounded-full p-1.5';
const customFieldWrapper = 'flex justify-center';
export const pendingCancelSubmissionColumns: () => Column[] = () => [
  {
    id: 'delete',
    field: 'delete',
    label: getString('cancellation.columns.deleteCancellation'),
    customFieldClass: customFieldWrapper,
    disabled: true,
    clickable: true,
    customField: true,
    iconClass: commonIconClass,
    icon: <TrashIconRounded fillColor="white" />,
  },
  {
    id: 'reject',
    field: 'reject',
    label: getString('cancellation.columns.rejectCancellation'),
    customFieldClass: customFieldWrapper,
    disabled: true,
    clickable: true,
    customField: true,
    iconClass: commonIconClass,
    icon: <FileReject fillColor="white" />,
  },
  {
    id: 'email',
    field: 'email',
    label: getString('cancellation.columns.sendEmailToInsurer'),
    customFieldClass: customFieldWrapper,
    disabled: true,
    clickable: true,
    customField: true,
    iconClass: commonIconClass,
    icon: <EmailRounded fillColor="white" />,
  },
  {
    id: 'orderId',
    minWidth: 100,
    label: 'leadDetailFields.orderId',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'earliestPolicyStartDate',
    minWidth: 120,
    label: 'tableListing.policyStartDate',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'deliveryOption',
    minWidth: 150,
    label: 'tableListing.deliveryOption',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'totalInvoiced',
    minWidth: 120,
    label: 'tableListing.totalInvoiced',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'insuredPerson',
    minWidth: 210,
    label: 'tableListing.insuredPerson',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'licensePlate',
    minWidth: 120,
    label: 'text.licensePlate',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'orderCreated',
    minWidth: 120,
    label: 'tableListing.orderCreated',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'paymentStatus',
    minWidth: 150,
    label: 'text.paymentStatus',
    sorting: 'none',
    disabled: true,
  },
];

export const cancellationV2Columns = (
  handleOpenDocument: (
    refundAccountDocument: string,
    idCardDocument: string,
    urgentRefundFormDocument: string,
    cancellationEmailWithInsurer: string,
    orderItemId: string,
    orderItemName: string
  ) => void,
  handleOpenComments: (orderItemId: string, orderItemName: string) => void,
  handleOpenRefundForm: (row: any) => void,
  handleOpenChangeOrder: (row: any) => void,
  onlyViewDocument: boolean = false
) => [
  {
    id: 'refundAccountDocument',
    field: 'refundAccountDocument',
    label: '',
    minWidth: 30,
    disabled: true,
    clickable: true,
    customField: true,
    transform: (data: {
      refundAccountDocument: string;
      idCardDocument: string;
      orderItemId: string;
      customerRequest?: string;
    }) => (
      <button
        onClick={() => handleOpenRefundForm(data)}
        type="button"
        aria-label="open document"
        className={clsx(
          'cursor-pointer  w-[32px] h-[32px] rounded-full flex item-center border-none justify-center p-0 pt-[1px]',
          onlyViewDocument ? 'bg-gray-300' : 'bg-primary'
        )}
        disabled={onlyViewDocument}
      >
        <RefundIcon fill="white" className="w-7" />
      </button>
    ),
  },
  {
    id: 'changeOrderIcon',
    field: 'changeOrderIcon',
    label: '',
    minWidth: 30,
    disabled: true,
    clickable: true,
    customField: true,
    transform: (data: {
      refundAccountDocument: string;
      idCardDocument: string;
      orderItemId: string;
      customerRequest?: string;
    }) => (
      <button
        onClick={() => handleOpenChangeOrder?.(data)}
        type="button"
        aria-label="open document"
        className={clsx(
          'cursor-pointer  w-[32px] h-[32px] rounded-full flex item-center border-none justify-center p-0 pt-[3px]',
          onlyViewDocument ? 'bg-gray-300' : 'bg-primary'
        )}
        disabled={onlyViewDocument}
      >
        <EditIcon fillColor="white" className="w-6" />
      </button>
    ),
  },
  {
    id: 'viewDocumentIcon',
    field: 'viewDocumentIcon',
    label: '',
    minWidth: 30,
    disabled: true,
    clickable: true,
    customField: true,
    transform: (data: {
      refundAccountDocument: string;
      idCardDocument: string;
      urgentRefundFormDocument: string;
      cancellationEmailWithInsurer: string;
      orderItemId: string;
      item: {
        name: string;
      };
    }) => (
      <button
        onClick={() =>
          handleOpenDocument?.(
            data.refundAccountDocument,
            data.idCardDocument,
            data.urgentRefundFormDocument,
            data.cancellationEmailWithInsurer,
            data.orderItemId,
            data.item.name
          )
        }
        type="button"
        aria-label="open document"
        className="cursor-pointer bg-primary w-[32px] h-[32px] rounded-full flex item-center justify-center p-0 pt-[2px]"
      >
        <SlipIcon fillColor="white" className="w-5" />
      </button>
    ),
  },
  {
    id: 'idCardDocument',
    field: 'idCardDocument',
    label: '',
    minWidth: 50,
    disabled: true,
    clickable: true,
    customField: true,
    transform: (data: any) => (
      <button
        onClick={() => {
          handleOpenComments?.(data.orderItemId, data.orderItemName);
        }}
        type="button"
        aria-label="open comment"
        className="bg-primary text-white cursor-pointer w-[32px] h-[32px] rounded-full flex item-center justify-center pt-[2px]"
      >
        <CommentIcon className="w-5" />
      </button>
    ),
  },
  {
    id: 'orderItemId',
    label: getString('text.orderItemId'),
    field: 'item.humanId',
    minWidth: 160,
    sorting: true, // sorting not work
    // disabled: true, // maybe we should disable sorting for now. Cox is not working for this field in BE
  },
  {
    id: 'productType',
    field: 'productType',
    label: getString('tableListing.productType'),
    minWidth: 160,
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      data?.productType
        ? (ProductTypeOptions.find(
            (item: any) => item.value === data?.productType
          )?.title ?? data?.productType)
        : '-',
  },
  {
    id: 'policyNumber',
    field: 'policyNumber',
    label: getString('tableListing.policyNumber'),
    minWidth: 160,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'lastCancellationStatusDate',
    minWidth: 180,
    label: 'cancellation.lastCancellationStatusDate',
    sorting: 'none',
    field: 'accounting.updateTime',
  },
  {
    id: 'cancellationReason',
    minWidth: 200,
    label: 'cancellation.cancellationReason',
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      data?.cancellationReason !== '-'
        ? getString(data?.cancellationReason)
        : '-',
  },
  {
    id: 'customerRequest',
    field: 'customerRequest',
    label: getString('tableListing.customerRequest'),
    minWidth: 160,
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      customerRequestOptions.find(
        (option) => option.value === data?.customerRequest
      )?.title ?? '-',
  },
  {
    id: 'leadForChangeOrder',
    field: 'leadForChangeOrder',
    label: getString('tableListing.leadForChangeOrder'),
    minWidth: 160,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'refundRequest',
    field: 'refundRequest',
    label: getString('tableListing.refundRequest'),
    minWidth: 160,
    sorting: 'none',
    disabled: true,
  },
  // {
  //   id: 'usedCreditShell',
  //   field: 'usedCreditShell',
  //   label: getString('tableListing.usedCreditShell'),
  //   minWidth: 160,
  //   sorting: 'none',
  //   disabled: true,
  // },
  // {
  //   id: 'availableCreditShell',
  //   field: 'availableCreditShell',
  //   label: getString('tableListing.availableCreditShell'),
  //   minWidth: 160,
  //   sorting: 'none',
  //   disabled: true,
  // },
  {
    id: 'insurer',
    minWidth: 210,
    label: 'tableListing.insurer',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'totalInvoiced',
    minWidth: 120,
    label: 'cancellation.premium',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'invoicedAmount',
    field: 'invoicedAmount',
    minWidth: 120,
    label: 'cancellation.invoicedAmount',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'insuredPerson',
    minWidth: 210,
    label: 'tableListing.insuredPerson',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'licensePlate',
    minWidth: 120,
    label: 'text.licensePlate',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'chasisNumber',
    minWidth: 120,
    label: 'text.chassisNumber',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'orderCreated',
    minWidth: 120,
    label: 'tableListing.orderCreated',
    sorting: 'none',
    field: 'item.createTime',
  },
  {
    id: 'policyStartDate',
    minWidth: 150,
    label: 'tableListing.policyStartDate',
    sorting: 'none',
    field: 'item.policyStartDate',
  },
  {
    id: 'paymentPlan',
    minWidth: 120,
    label: 'cancellation.paymentPlan',
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      data?.paymentPlan !== '-'
        ? getString(`paymentOptions.${data?.paymentPlan}`)
        : '-',
  },
  {
    id: 'paymentStatus',
    minWidth: 150,
    label: 'text.paymentStatus',
    sorting: 'none',
    disabled: true,
    transform: (data: any) => {
      if (data?.paymentStatus === true)
        return getString('tableListing.fullyPaid');
      if (data?.paymentStatus === false)
        return getString('tableListing.notFullyPaid');
      return '-';
    },
  },
  {
    id: 'refundAmountFromInsurer',
    minWidth: 200,
    label: 'cancellation.refundAmountFromInsurer',
    sorting: 'none',
    field: 'accounting.refundInsurerAmount.units',
  },
  {
    id: 'refundAmountToCustomer',
    minWidth: 200,
    label: 'cancellation.refundAmountToCustomer',
    sorting: 'none',
    field: 'accounting.refundAmountCustomer.units',
  },
  {
    id: 'urgentRefund',
    field: 'urgentRefund',
    label: getString('cancellation.urgentRefund'),
    minWidth: 200,
    sorting: 'none',
    disabled: true,
    transform: (data: any) => {
      if (data?.urgentRefund === true) return getString('text.yes');
      if (data?.urgentRefund === false) return getString('text.no');
      return '-';
    },
  },
  {
    id: 'urgentRefundReason',
    field: 'urgentRefundReason',
    label: getString('cancellation.urgentRefundReason'),
    minWidth: 200,
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      getString(
        urgentRefundReasonOptions?.find(
          (reason) => reason.value === data?.accounting?.urgentRefundReason
        )?.title ?? '-'
      ),
  },
  {
    id: 'totalCancellationFee',
    field: 'totalCancellationFee',
    label: getString('cancellation.totalCancellationFee'),
    minWidth: 200,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'usedCreditShell',
    field: 'usedCreditShell',
    label: getString('tableListing.usedCreditShell'),
    minWidth: 160,
    sorting: 'none',
    disabled: true,
  },
];

export const pendingOnCustomer = (
  handleOpenDocument?: (
    refundAccountDocument: string,
    idCardDocument: string,
    orderItemId: string
  ) => void,
  handleOpenComments?: (orderItemId: string, orderItemName: string) => void
) => [
  {
    id: 'refundAccountDocument',
    field: 'refundAccountDocument',
    label: '',
    minWidth: 30,
    disabled: true,
    clickable: true,
    customField: true,
    transform: (data: {
      refundAccountDocument: string;
      idCardDocument: string;
      orderItemId: string;
    }) => (
      <button
        onClick={() =>
          handleOpenDocument?.(
            data.refundAccountDocument,
            data.idCardDocument,
            data.orderItemId
          )
        }
        type="button"
        aria-label="open document"
        className="cursor-pointer bg-primary w-[32px] h-[32px] rounded-full flex item-center justify-center p-0 pt-[2px]"
      >
        <SlipIcon fillColor="white" className="w-5" />
      </button>
    ),
  },
  {
    id: 'idCardDocument',
    field: 'idCardDocument',
    label: '',
    minWidth: 50,
    disabled: true,
    clickable: true,
    customField: true,
    transform: (data: any) => (
      <button
        onClick={() => {
          handleOpenComments?.(data.orderItemId, data.orderItemName);
        }}
        type="button"
        aria-label="open comment"
        className="bg-primary text-white cursor-pointer w-[32px] h-[32px] rounded-full flex item-center justify-center pt-[2px]"
      >
        <CommentIcon className="w-5" />
      </button>
    ),
  },
  {
    id: 'orderItemId',
    label: getString('text.orderItemId'),
    field: 'item.humanId',
    minWidth: 160,
    sorting: true, // sorting not work
    // disabled: true, // maybe we should disable sorting for now. Cox is not working for this field in BE
  },
  {
    id: 'policyNumber',
    field: 'policyNumber',
    label: getString('tableListing.policyNumber'),
    minWidth: 160,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'changeOrderFlag',
    field: 'isChangeOrder',
    label: 'cancellation.changeOrder',
    minWidth: 120,
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'lastCancellationStatusDate',
    minWidth: 180,
    label: 'cancellation.lastCancellationStatusDate',
    sorting: 'none',
    field: 'accounting.updateTime',
  },
  {
    id: 'totalInvoiced',
    minWidth: 120,
    label: 'cancellation.premium',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'insuredPerson',
    minWidth: 210,
    label: 'tableListing.insuredPerson',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'licensePlate',
    minWidth: 120,
    label: 'text.licensePlate',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'chasisNumber',
    minWidth: 120,
    label: 'text.chassisNumber',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'orderCreated',
    minWidth: 120,
    label: 'tableListing.orderCreated',
    sorting: 'none',
    field: 'item.createTime',
  },
  {
    id: 'policyStartDate',
    minWidth: 150,
    label: 'tableListing.policyStartDate',
    sorting: 'none',
    field: 'item.policyStartDate',
  },
  {
    id: 'paymentPlan',
    minWidth: 120,
    label: 'cancellation.paymentPlan',
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      data?.paymentPlan !== '-'
        ? getString(`paymentOptions.${data?.paymentPlan}`)
        : '-',
  },
  {
    id: 'paymentStatus',
    minWidth: 150,
    label: 'text.paymentStatus',
    sorting: 'none',
    disabled: true,
    transform: (data: any) => {
      if (data?.paymentStatus === true)
        return getString('tableListing.fullyPaid');
      if (data?.paymentStatus === false)
        return getString('tableListing.notFullyPaid');
      return '-';
    },
  },
  {
    id: 'premiumRemittanceStatus',
    minWidth: 150,
    label: 'cancellation.premiumRemittanceStatus',
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      PremiumRemittanceStatusOptions.find(
        (option) => option.value === data?.premiumRemittanceStatus
      )?.title ?? '-',
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
    minWidth: 150,
    label: 'cancellation.premiumReturnStatus',
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      PremiumRemittanceStatusOptions.find(
        (option) => option.value === data?.premiumReturnStatus
      )?.title ?? '-',
  },
  {
    id: 'latestPremiumRemittanceStatusDate',
    minWidth: 200,
    label: 'cancellation.latestPremiumRemittanceStatusDate',
    sorting: 'none',
    field: 'latestPremiumRemittanceStatusDate', // sorting not work
  },
  {
    id: 'latestPremiumReturnStatusDate',
    minWidth: 200,
    label: 'cancellation.latestPremiumReturnStatusDate',
    sorting: 'none',
    field: 'latestPremiumReturnStatusDate', // sorting not work
  },
  {
    id: 'actualReturnAmountFromInsurer',
    minWidth: 200,
    label: 'cancellation.actualReturnAmountFromInsurer',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'premiumReturnDateFromInsurer',
    label: 'text.premiumReturnDateFromInsurer',
    minWidth: 200,
    field: 'accounting.returnInsurerTime',
    sorting: 'none',
  },
  {
    id: 'actualReturnAmountFromRCB',
    minWidth: 200,
    label: 'cancellation.actualReturnAmountFromRCB',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'premiumReturnDateFromRCB',
    label: 'text.premiumReturnDateFromRCB',
    minWidth: 200,
    field: 'accounting.returnRcbTime',
    sorting: 'none',
  },
  {
    id: 'cancellationReason',
    minWidth: 200,
    label: 'cancellation.cancellationReason',
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      data?.cancellationReason !== '-'
        ? getString(data?.cancellationReason)
        : '-',
  },
  {
    id: 'cancellationContactDate',
    minWidth: 200,
    label: 'cancellation.cancellationContactDate',
    sorting: 'none',
    field: 'accounting.cancellationCustomerContactTime',
  },
  {
    id: 'policyEndDate',
    minWidth: 200,
    label: 'cancellation.policyEndDate',
    sorting: 'none',
    field: 'accounting.policyEndTime',
  },
  {
    id: 'bankAccountNumber',
    minWidth: 200,
    label: 'cancellation.bankAccountNumber',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'bankName',
    minWidth: 200,
    label: 'cancellation.bankName',
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      bankLists?.find((b) => b.name === data?.bankName)?.label ?? '-',
  },
  {
    id: 'customerReceivePolicy',
    minWidth: 200,
    label: 'cancellation.customerReceivePolicy',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'policyReturnDate',
    minWidth: 200,
    label: 'cancellation.policyReturnDate',
    sorting: 'none',
    field: 'accounting.policyReturnTime',
  },
  {
    id: 'cancellationContactedDate',
    minWidth: 200,
    label: 'cancellation.cancellationContactedDate',
    sorting: 'none',
    field: 'accounting.cancellationInsurerContactTime',
  },
  {
    id: 'refundCalculationMethod',
    minWidth: 200,
    label: 'cancellation.refundCalculationMethod',
    sorting: 'none',
    disabled: true,
    transform: (data: any) =>
      refundCalculationMethods.find(
        (method) => method.value === data?.refundCalculationMethod
      )?.label ?? '-',
  },
  {
    id: 'refundAmountFromInsurer',
    minWidth: 200,
    label: 'cancellation.refundAmountFromInsurer',
    sorting: 'none',
    field: 'accounting.refundInsurerAmount.units',
  },
  {
    id: 'commissionClawback',
    minWidth: 200,
    label: 'cancellation.commissionClawback',
    sorting: 'none',
    disabled: true,
  },
  {
    id: 'refundAmountToCustomer',
    minWidth: 200,
    label: 'cancellation.refundAmountToCustomer',
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
    minWidth: 150,
    label: 'cancellation.refundDate',
    sorting: 'none',
    field: 'accounting.refundCustomerTime',
  },
];

export const fields = () =>
  [
    {
      label: 'cancellation.popup.cancellationContactedDate',
      value: '',
      type: 'date',
      tab: 'pending-on-customer',
    },
    {
      label: 'cancellation.popup.policyEndDate',
      value: '',
      type: 'date',
      tab: 'pending-confirmation-on-customer',
    },
    {
      label: 'cancellation.popup.bankAccountNumber',
      value: '',
      type: 'number',
      placeholder: '1234567890',
      tab: 'pending-confirmation-on-customer',
    },
    {
      label: 'cancellation.popup.bankName',
      value: '',
      type: 'dropdown',
      options: bankLists,
      tab: 'pending-confirmation-on-customer',
    },
    {
      label: 'cancellation.popup.customerReceivePolicy',
      value: '',
      type: 'radio',
      tab: 'pending-confirmation-on-customer',
      options: [
        {
          value: true,
          label: 'Yes',
        },
        {
          value: false,
          label: 'No',
        },
      ],
    },
    {
      label: 'cancellation.popup.policyReturnDate',
      value: '',
      type: 'date',
      tab: 'pending-policy-return',
    },
    {
      label: 'cancellation.popup.cancellationContactedDateInsurer',
      value: '',
      type: 'date',
      tab: 'pending-cancel-submission',
    },
    {
      label: 'cancellation.popup.refundCalculationMethod',
      value: '',
      type: 'dropdown',
      options: refundCalculationMethods,
      tab: 'pending-cancel-confirmation-submission',
    },
    {
      label: 'cancellation.popup.refundAmountFromInsurer',
      value: '',
      type: 'number',
      placeholder: '0',
      tab: 'pending-cancel-confirmation-submission', // Pending Confirmation (Insurer)
    },
    {
      label: 'cancellation.popup.commissionClawback',
      value: '',
      type: 'number',
      placeholder: '0',
      tab: 'completed',
    },
    {
      label: 'cancellation.popup.refundAmountToCustomer',
      value: '',
      type: 'number',
      placeholder: '0',
      tab: 'pending-cancel-confirmation-submission',
    },
    {
      label: 'cancellation.popup.refundDate',
      value: '',
      type: 'date',
      tab: 'pending-refund',
    },
    {
      label: 'text.actualRefundAmountToCustomer',
      value: '',
      type: 'number',
      placeholder: '0',
      tab: 'pending-refund',
    },
    {
      label: 'cancellation.popup.grossPremium',
      value: '',
      type: 'text',
      placeholder: '0',
      tab: 'tabv2',
      isReadOnly: true,
    },
    {
      label: 'cancellation.popup.invoiceAmount',
      value: '',
      type: 'text',
      placeholder: '0',
      tab: 'tabv2',
      isReadOnly: true,
    },
    {
      label: 'cancellation.popup.refundCalculationMethod',
      value: '',
      type: 'dropdown',
      options: refundCalculationMethods,
      tab: 'tabv2',
    },
    {
      label: 'cancellation.popup.commissionClawback',
      value: '',
      type: 'number',
      placeholder: '0',
      tab: 'tabv2',
    },
    {
      label: 'cancellation.popup.refundAmountFromInsurer',
      value: '',
      type: 'number',
      placeholder: '0',
      tab: 'tabv2',
      showStar: true,
    },
    {
      label: 'cancellation.popup.usedCreditShell',
      value: '',
      type: 'text',
      placeholder: '0',
      tab: 'tabv2',
      isReadOnly: true,
    },
    {
      label: 'cancellation.popup.availableCreditShell',
      value: '',
      type: 'text',
      placeholder: '0',
      tab: 'tabv2',
      isReadOnly: true,
      showStar: true,
    },
  ] as CommonSelectOption[];

export const initialFilter = {
  product: PRODUCTS.CAR_PRODUCT_INSURANCE.split('/')[1],
  pageSize: 15,
  filter: '',
  type: 'cancellation',
};

export const initialFilterV2 = {
  pageSize: 15,
  filter: 'item.isCancelled=true',
  type: 'cancellation',
};

export const initialStatusData = {
  cancellationContactedDate: '',
  policyEndDate: '',
  bankAccountNumber: '',
  bankName: '',
  customerReceivePolicy: null,
  policyReturnDate: '',
  cancellationContactedDateInsurer: '',
  refundDate: '',
  refundCalculationMethod: '',
  refundAmountFromInsurer: '',
  commissionClawback: '',
  refundAmountToCustomer: '',
  actualRefundAmountToCustomer: '',
  slip: null,
  documentId: null,
};

export const initialStatusDataV2 = {
  invoiceAmount: '',
  refundCalculationMethod: '',
  refundAmountFromInsurer: '',
  totalCancellationFee: '',
  usedCreditShell: '',
  availableCreditShell: '',
  grossPremium: '',
  creditUsed: undefined,
  processingFee: '',
  discountProRate: '',
  cancellationFee: '',
  processingFeeChecked: false,
  cancellationFeeChecked: false,
  discountProRateChecked: false,
  voucherChecked: false,
};

export const prepareFilter = (
  payload: any,
  orderAllColSettings: any,
  setOrderAllColSettings: (para: any) => void,
  setCurrentFilter: (para: any) => void,
  currentFilter: any,
  newPageState?: any,
  columnId?: string,
  tabFilter = ''
) => {
  const filters = buildFilter(payload, filterMapOrderCancellation, []);
  let filterEdited = filters;
  if (filters?.includes('attributes.paymentMethod="DIRECT_DEBIT"')) {
    filterEdited = filters.filter(
      (filter) => !filter.includes('attributes.paymentPlan')
    );
  }
  const queryParts = getQueryParts(
    '',
    getFilter(payload, filterEdited),
    newPageState.pageSize ?? 15,
    newPageState.currentPage ?? 1,
    sortParams(columnId as string, setOrderAllColSettings, orderAllColSettings)
  );
  setCurrentFilter({
    ...currentFilter,
    filter: `${tabFilter}${queryParts
      .filter(
        (query) => !query.includes('page_size') && !query.includes('type')
      )
      .join('&')
      .replace('filter=', '')}`,
  });
};

export const mappingFields = {
  commissionClawback: 'commission_clawback',
  refundCalculationMethod: 'refund_calculation_method',
  refundAmountFromInsurer: 'refund_insurer_amount',
};

export const setFieldsTouched = (
  label: string,
  isTouched: boolean,
  setFixedData: (data: any) => void
) =>
  setFixedData((prev: any) => {
    const key = label?.split('.').pop() ?? '';
    const mappingField = mappingFields[key as keyof typeof mappingFields];
    return {
      ...prev,
      [mappingField]: isTouched,
    };
  });

export const handleChange = (
  e: any,
  label: string,
  setStatusData: (prevState: any) => void,
  setFixedData: (data: any) => void
) => {
  const field = label.split('.').pop();
  let value: any;
  if (e?.value) {
    value = e?.value;
  }
  if (e?.target?.checked) {
    value = e?.target?.checked;
  }
  if (e?.target?.value) {
    value = e?.target?.value;
  }
  setFieldsTouched(label, true, setFixedData);
  setStatusData((prevState: any) => ({
    ...prevState,
    [field ?? '-']: value,
  }));
};

export const handleDateChange = (
  value: any,
  label: string,
  setStatusData: (prevState: any) => void,
  setFixedData: (data: any) => void
) => {
  const field = label.split('.').pop();
  setFieldsTouched(label, true, setFixedData);
  setStatusData((prevState: any) => ({
    ...prevState,
    [field ?? '-']: value,
  }));
};

export const uploadDocumentSlipOrID = async ({
  type,
  orderItemId,
  showErrorSnackbar,
  statusData,
  uploadDocumentFile,
}: {
  type: string;
  orderItemId: string;
  showErrorSnackbar: (message: string) => void;
  statusData: Record<string, any>;
  uploadDocumentFile: (params: any) => Promise<any>;
}) => {
  try {
    if (statusData[type] !== null) {
      const { data } = await uploadDocumentFile({
        file: statusData[type],
        uid: orderItemId,
      });
      await uploadDocumentViaDocumentService(
        data?.uploadUrl,
        statusData[type]?.originalFile
      );
      return data?.document;
    }
    return {};
  } catch (err) {
    console.error('Document upload failed:', err); // use the error

    showErrorSnackbar(
      getString('text.errorMessage', {
        message: getString('text.uploadFailed'),
      })
    );
    return {};
  }
};

export const checkSaveButtonDisabled = (cancellationStatus: string) =>
  [
    'CANCELLATION_STATUS_CHANGE_ORDER_COMPLETED',
    'CANCELLATION_STATUS_CUSTOMER_REFUND_AND_CHANGE_ORDER_COMPLETED',
    'CANCELLATION_STATUS_CUSTOMER_REFUND',
    'CANCELLATION_STATUS_COMPLETED',
  ].includes(cancellationStatus);

export const refundProviderOptions = [
  {
    id: 1,
    title: getString('cancellation.popup.refundServiceProvider.OMISE'),
    value: 'OMISE',
  },
  {
    id: 2,
    title: getString('cancellation.popup.refundServiceProvider.TWOCTWOP'),
    value: 'TWOCTWOP',
  },
  {
    id: 4,
    title: getString('cancellation.popup.refundServiceProvider.ONE_TWO_THREE'),
    value: 'ONE_TWO_THREE',
  },
  {
    id: 5,
    title: getString('cancellation.popup.refundServiceProvider.AEON'),
    value: 'AEON',
  },
  {
    id: 6,
    title: getString('cancellation.popup.refundServiceProvider.AOMSIN'),
    value: 'AOMSIN',
  },
  {
    id: 7,
    title: getString(
      'cancellation.popup.refundServiceProvider.BACKOFFICE_MANUAL_CHARGED'
    ),
    value: 'BACKOFFICE_MANUAL_CHARGED',
  },
  {
    id: 8,
    title: getString('cancellation.popup.refundServiceProvider.BANGKOK_BANK'),
    value: 'BANGKOK_BANK',
  },
  {
    id: 9,
    title: getString('cancellation.popup.refundServiceProvider.CENTRAL'),
    value: 'CENTRAL',
  },
  {
    id: 10,
    title: getString('cancellation.popup.refundServiceProvider.CIMB'),
    value: 'CIMB',
  },
  {
    id: 11,
    title: getString('cancellation.popup.refundServiceProvider.CITIBANK'),
    value: 'CITIBANK',
  },
  {
    id: 12,
    title: getString('cancellation.popup.refundServiceProvider.KTC'),
    value: 'KTC',
  },
  {
    id: 13,
    title: getString('cancellation.popup.refundServiceProvider.KASIKORN'),
    value: 'KASIKORN',
  },
  {
    id: 14,
    title: getString('cancellation.popup.refundServiceProvider.KIATNAKIN'),
    value: 'KIATNAKIN',
  },
  {
    id: 15,
    title: getString('cancellation.popup.refundServiceProvider.KRUNGSRI'),
    value: 'KRUNGSRI',
  },
  {
    id: 16,
    title: getString(
      'cancellation.popup.refundServiceProvider.KRUNGSRI_TESCO_LOTUS_VISA_CARD'
    ),
    value: 'KRUNGSRI_TESCO_LOTUS_VISA_CARD',
  },
  {
    id: 17,
    title: getString(
      'cancellation.popup.refundServiceProvider.KRUNGSRI_FIRST_CHOICE'
    ),
    value: 'KRUNGSRI_FIRST_CHOICE',
  },
  {
    id: 18,
    title: getString('cancellation.popup.refundServiceProvider.KRUNGTHAI'),
    value: 'KRUNGTHAI',
  },
  {
    id: 19,
    title: getString('cancellation.popup.refundServiceProvider.LAND_AND_HOUSE'),
    value: 'LAND_AND_HOUSE',
  },
  {
    id: 20,
    title: getString('cancellation.popup.refundServiceProvider.LINE_PAY'),
    value: 'LINE_PAY',
  },
  {
    id: 21,
    title: getString('cancellation.popup.refundServiceProvider.NEW_PLATFORM'),
    value: 'NEW_PLATFORM',
  },
  {
    id: 22,
    title: getString('cancellation.popup.refundServiceProvider.PROMPTPAY'),
    value: 'PROMPTPAY',
  },
  {
    id: 23,
    title: getString('cancellation.popup.refundServiceProvider.SCB'),
    value: 'SCB',
  },
  {
    id: 24,
    title: getString(
      'cancellation.popup.refundServiceProvider.STANDARD_CHARTER'
    ),
    value: 'STANDARD_CHARTER',
  },
  {
    id: 25,
    title: getString('cancellation.popup.refundServiceProvider.TMB'),
    value: 'TMB',
  },
  {
    id: 26,
    title: getString('cancellation.popup.refundServiceProvider.THANACHART'),
    value: 'THANACHART',
  },
  {
    id: 27,
    title: getString('cancellation.popup.refundServiceProvider.TISCO'),
    value: 'TISCO',
  },
  {
    id: 28,
    title: getString('cancellation.popup.refundServiceProvider.UOB'),
    value: 'UOB',
  },
  {
    id: 29,
    title: getString('cancellation.popup.refundServiceProvider.RABBIT_LENDING'),
    value: 'RABBIT_LENDING',
  },
  {
    id: 30,
    title: getString('cancellation.popup.refundServiceProvider.RCB'),
    value: 'RCB',
  },
  {
    id: 31,
    title: getString('cancellation.popup.refundServiceProvider.RABBIT_CARE'),
    value: 'RABBIT_CARE',
  },
  {
    id: 32,
    title: getString('cancellation.popup.refundServiceProvider.INSURER'),
    value: 'INSURER',
  },
];

export const refundMethodOptions = [
  {
    id: 1,
    title: getString('cancellation.popup.refundMethod.BANK_TRANSFER'),
    value: 'BANK_TRANSFER',
  },
  {
    id: 2,
    title: getString('cancellation.popup.refundMethod.ONLINECARD'),
    value: 'ONLINECARD',
  },
  {
    id: 3,
    title: getString('cancellation.popup.refundMethod.EDC'),
    value: 'EDC',
  },
  {
    id: 4,
    title: getString('cancellation.popup.refundMethod.VEDC'),
    value: 'VEDC',
  },
  {
    id: 5,
    title: getString('cancellation.popup.refundMethod.CASH'),
    value: 'CASH',
  },
  {
    id: 6,
    title: getString('cancellation.popup.refundMethod.DIRECT_TO_INSURER'),
    value: 'DIRECT_TO_INSURER',
  },
];

export const omitFieldsIfNotChange = (
  payload: any,
  fixedData: Record<string, boolean>
) => {
  const payloadOmittedUnfixedField: Record<string, any> = {};
  Object.keys(payload).forEach((key) => {
    if (fixedData[key]) {
      payloadOmittedUnfixedField[key] = payload[key];
    }
  });
  return payloadOmittedUnfixedField;
};

export const checkDisableInsurerAmount = (
  availableCreditShell: string | number,
  usedCreditShell: string | number,
  paidChargesLength: number
): boolean =>
  !(
    parseFloat(availableCreditShell.toString()) > 0 ||
    (availableCreditShell?.toString() === '0' &&
      usedCreditShell?.toString() === '0' &&
      paidChargesLength > 0)
  );

export function getRefundAmountField(
  value: unknown,
  currencyToMoney: (v: number) => any
) {
  return value !== undefined && value !== null
    ? { ...currencyToMoney(value as number) }
    : undefined;
}

export const feesStructures = (
  processingFee: number,
  totalCancellationFee: number,
  discountProRate: number,
  voucherValue: number
) => [
  {
    name: 'processingFee',
    checkedName: 'processingFeeChecked',
    titleKey: 'cancellation.popup.processingFee',
    touchedField: 'processing_fee',
    value: processingFee,
  },
  {
    name: 'cancellationFee',
    checkedName: 'cancellationFeeChecked',
    titleKey: 'cancellation.popup.cancellationFee',
    touchedField: 'cancellation_fee',
    value: totalCancellationFee,
  },
  {
    name: 'discountProRate',
    checkedName: 'discountProRateChecked',
    titleKey: 'cancellation.popup.discountProRate',
    touchedField: 'discount_pro_rate',
    value: discountProRate,
  },
  {
    name: 'voucher',
    checkedName: 'voucherChecked',
    titleKey: 'cancellation.popup.voucher',
    touchedField: 'voucher',
    value: voucherValue,
  },
];
