import React from 'react';

import Controls from 'presentation/components/controls/Control';
import MultiDateRangeWithType from 'presentation/components/controls/MultiDateRangeWithType';
import { IFilterFormField } from 'presentation/components/FilterPanel/FilterField';
import SearchField from 'presentation/components/leads/searchField/SearchField';
import { UserRoleID } from 'presentation/components/ProtectedRouteHelper';
import { getString } from 'presentation/theme/localization';

import {
  transformUrlQueryDateBetween,
  transformUrlQueryMultiSelect,
  transformUrlQuerySearch,
} from '../Contracts/helper';

export const dateRangeFilter = (
  name: string,
  lablel: string,
  handleClick: () => void
) => ({
  InputComponent: Controls.DateRange,
  inputProps: {
    name,
    label: lablel,
    handleOnclickDateRange: handleClick,
    filterType: 'detail',
    fixedLabel: true,
    responsive: {
      xs: 6,
      md: 3,
    },
  },
});

export const initialFilterValues = {
  showDeleted: false,
  search: [],
  paymentType: '',
  paymentStatus: [],
  transactionStatus: '',
  paymentChannel: '',
  opnAccountRecipient: '',
  overDue: [],
  salesAgents: [],
  paymentDate: {
    range: {
      startDate: null,
      endDate: null,
    },
  },
  dueDate: {
    range: {
      startDate: null,
      endDate: null,
    },
  },
  appointmentDate: {
    range: {
      startDate: null,
      endDate: null,
    },
  },
  createDate: {
    range: {
      startDate: null,
      endDate: null,
    },
  },
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
  paymentMethod: [],
  paymentOption: [],
  overdue: [],
};

export const PaymentTransactionStatusOptions = [
  {
    id: 1,
    title: getString('menu.carePay.pending'),
    value: 'PENDING',
  },
  {
    id: 4,
    title: getString('menu.carePay.paid'),
    value: 'SUCCESSFUL',
  },
  {
    id: 4,
    title: getString('menu.carePay.Overdue'),
    value: 'OVERDUE',
  },
  {
    id: 4,
    title: getString('menu.carePay.cancelled'),
    value: 'CANCELLED',
  },
];

export const PaymentMethodOptions = [
  {
    id: 0,
    title: getString('paymentMethods.QR_CODE'),
    value: 'QR_CODE',
  },
  {
    id: 1,
    title: getString('paymentMethods.ONLINECARD'),
    value: 'ONLINECARD',
  },
  {
    id: 2,
    title: getString('menu.carePay.cash'),
    value: 'CASH',
  },
  {
    id: 3,
    title: getString('discountPricing.directPayment'),
    value: 'DIRECT_PAYMENT',
  },
  {
    id: 8,
    title: getString('paymentMethods.EDC'),
    value: 'EDC',
  },
  {
    id: 10,
    title: getString('menu.carePay.transfer'),
    value: 'BANK_TRANSFER',
  },
  {
    id: 11,
    title: getString('menu.carePay.vedc'),
    value: 'VEDC',
  },
  {
    id: 12,
    title: getString('paymentMethods.DIRECT_DEBIT'),
    value: 'DIRECT_DEBIT',
  },
  {
    id: 13,
    title: getString('paymentMethods.CREDIT_TERM'),
    value: 'CREDIT_TERM',
  },
  {
    id: 14,
    title: getString('paymentMethods.CHEQUE'),
    value: 'CHEQUE',
  },
];

export const SearchOptions = [
  {
    key: 1,
    title: getString('carepay.contract.leadId'),
    value: 'transaction.leadHumanId.keyword',
  },
  {
    key: 2,
    title: getString('menu.carePay.customerName'),
    value: 'customerName',
  },
  {
    key: 4,
    title: getString('menu.carePay.customerPhone'),
    value: 'attributes.customerPhone',
  },
  {
    key: 5,
    title: getString('menu.carePay.licensePlate'),
    value: 'attributes.lead.carLicensePlate.keyword',
  },
];

export const PaymentTypeOptions = [
  {
    id: 1,
    title: getString('menu.carePay.fullPayment'),
    value: 'FULL_PAYMENT',
    methods: ['QR_CODE', 'ONLINECARD'],
  },
  {
    id: 2,
    title: getString('menu.carePay.paymentType.installment.main'),
    value: 'RABBIT_CARE_INSTALLMENT',
    methods: ['QR_CODE'],
  },
  {
    id: 3,
    title: getString('menu.carePay.paymentType.installment.creditCard'),
    value: 'CREDIT_CARD_INSTALLMENT',
  },
  {
    id: 4,
    title: getString('menu.carePay.paymentType.installment.directDebit'),
    value: 'RABBIT_CARE_INSTALLMENT_DEBIT',
    methods: ['DIRECT_DEBIT'],
  },
];

export const PaymentStatusOptions = [
  {
    id: 1,
    title: getString('menu.carePay.fullyPaid'),
    value: 'PAID',
  },
  {
    id: 2,
    title: getString('menu.carePay.notFullyPaid'),
    value: 'NOT_PAID',
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
      placeholder: getString('text.search'),
      responsive: {
        xs: 6,
        md: 6,
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
            id: 2,
            title: getString('menu.carePay.createDate'),
            value: 'transaction.createTime',
          },
          {
            id: 3,
            title: getString('transactionSlipModal.updateDate'),
            value: 'transaction.updateTime',
          },
          {
            id: 4,
            title: getString('menu.carePay.dueDate'),
            value: 'followups[].followup.dueDate',
          },
          {
            id: 5,
            title: getString('menu.carePay.paymentDate'),
            value: 'latestCharge.paymentDate',
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
      name: 'paymentOption',
      label: getString('menu.carePay.paymentOption'),
      options: PaymentTypeOptions,
      filterType: 'detail',
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
      options: PaymentTransactionStatusOptions,
      filterType: 'detail',
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
      name: 'paymentMethod',
      label: getString('menu.carePay.paymentMethod'),
      options: PaymentMethodOptions,
      filterType: 'detail',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
];

export function SelectCIMemebers() {
  return (
    <div className="flex m-3 gap-4" data-testid="ci-member-selector">
      <div className="flex items-center">
        <span className="font-medium mr-2">
          {getString('menu.carePay.ciMembers')}:
        </span>
        <span>
          <Controls.Select
            value=""
            name="ciMembers"
            className="w-48"
            selectField="title"
            options={[]}
            placeholder={`${getString('text.select')} ${getString(
              'menu.carePay.ciMembers'
            )}`}
          />
        </span>
      </div>
      <Controls.Button
        className="px-4 py-2 uppercase"
        color="primary"
        text={getString('text.assign')}
        disabled
      />
      <Controls.Button
        className="px-4 py-2 uppercase"
        color="primary"
        text={getString('text.unassign')}
        disabled
      />
    </div>
  );
}

export const formatFilterURI = (payload: any) => {
  let url = '';
  const {
    search,
    paymentType,
    paymentStatus,
    transactionStatus,
    paymentDate,
    dueDate,
    createDate,
  } = payload;
  if (search) {
    url += transformUrlQuerySearch(url, search);
  }
  const dateBetweens = [
    {
      name: 'charges[].paymentDate',
      value: paymentDate,
    },
    {
      name: 'followup.dueDate',
      value: dueDate,
    },
    {
      name: 'followup.createTime',
      value: createDate,
    },
  ];
  dateBetweens.forEach(({ name, value }) => {
    if (value) url += transformUrlQueryDateBetween(url, value, name);
  });
  const multiSelect = [
    {
      name: 'transaction.paymentOption',
      value: paymentType,
    },
  ];
  multiSelect.forEach(({ name, value }) => {
    if (value) url += transformUrlQueryMultiSelect(url, value, name);
  });
  const customFields = [
    {
      name: 'charges[].status',
      value: paymentStatus,
    },
    {
      name: 'transaction.statusCode',
      value: transactionStatus,
    },
  ];
  customFields.forEach(({ name, value }) => {
    if (value && value.length === 1) {
      if (value[0].value === 'PAID') {
        url += transformUrlQuerySearch(url, {
          selectValue: name,
          inputValue: 'SUCCESSFUL',
        });
      } else {
        url += transformUrlQuerySearch(url, {
          selectValue: `${name}!`,
          inputValue: 'SUCCESSFUL',
        });
      }
    }
  });
  return url;
};

export const getUserRoleAccess = (userRole: string) => {
  switch (userRole) {
    case UserRoleID.SuperAdmin:
      return {
        canAssign: true,
        canCreatePaymentLink: true,
        canSetUpSMS: true,
        canUpdatePaymentStatus: false,
        canAssignContract: true,
        canApproveContract: true,
        canUpdateDueDate: true,
        canAccessTravelPage: true,
        canCancelPolicy: true,
        canSendPolicyEmail: true,
        canDownloadPolicy: true,
      };
    case UserRoleID.Admin:
      return {
        canAssign: true,
        canCreatePaymentLink: true,
        canSetUpSMS: true,
        canUpdatePaymentStatus: false,
        canAssignContract: true,
        canApproveContract: true,
        canUpdateDueDate: true,
        canAccessTravelPage: true,
        canCancelPolicy: true,
        canSendPolicyEmail: true,
        canDownloadPolicy: true,
      };
    case UserRoleID.Accounting:
      return {
        canCancelPolicy: true,
        canAccessTravelPage: true,
      };
    case UserRoleID.InboundAgent:
      return {
        canSendPolicyEmail: true,
        canCancelPolicy: true,
        canDownloadPolicy: true,
        canAccessTravelPage: true,
      };
    case UserRoleID.BackOffice:
      return {
        canAssign: true,
        canCreatePaymentLink: true,
        canSetUpSMS: true,
        canUpdatePaymentStatus: false,
        canAssignContract: true,
        canApproveContract: true,
        canUpdateDueDate: true,
      };
    case UserRoleID.QualityControl:
      return {
        canAssign: false,
        canCreatePaymentLink: false,
        canSetUpSMS: false,
        canUpdatePaymentStatus: false,
        canAssignContract: true,
        canApproveContract: true,
      };
    case UserRoleID.CiSuperVisor:
      return {
        canAssign: true,
        canCreatePaymentLink: true,
        canSetUpSMS: true,
        canUpdatePaymentStatus: true,
        canAssignContract: false,
        canApproveContract: true,
        canUpdateDueDate: true,
      };
    case UserRoleID.CiAgent:
      return {
        canAssign: false,
        canCreatePaymentLink: true,
        canSetUpSMS: true,
        canUpdatePaymentStatus: true,
        canAssignContract: false,
        canApproveContract: true,
        canUpdateDueDate: true,
      };
    default:
      return {
        canAssign: false,
        canCreatePaymentLink: false,
        canSetUpSMS: false,
        canUpdatePaymentStatus: false,
        canAssignContract: false,
        canApproveContract: false,
      };
  }
};
