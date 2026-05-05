import { sub } from 'date-fns';

import { numberToMoney, satangToBahtNumber } from 'utils/currency';
import { formatDate } from 'utils/datetime';
import { UserRoles } from 'config/constant';
import Controls from 'presentation/components/controls/Control';
import { getString } from 'presentation/theme/localization';
import { ChargeResponse } from 'data/slices/transactionSlice/interface';

import { fields } from '../common/helper';
import {
  transformUrlQueryDateBetween,
  transformUrlQueryMultiSelect,
  transformUrlQuerySearch,
} from '../Contracts/helper';

export const QC_TEAMS_ROLES = [
  UserRoles.QUALITY_CONTROL,
  UserRoles.BACK_OFFICE,
];

export const RefundMethodOptions = [
  {
    id: 1,
    title: getString('paymentMethodsCarepay.BANK_TRANSFER'),
    value: 'BANK_TRANSFER',
  },
];

export const QCOptions = [
  {
    id: 1,
    title: getString('text.waiting'),
    value: 'WAITING',
  },
  {
    id: 2,
    title: getString('text.waitingForCheque'),
    value: 'WAITING_FOR_CHEQUE',
  },
  {
    id: 3,
    title: getString('text.pass'),
    value: 'PASS',
  },
  {
    id: 4,
    title: getString('text.reject'),
    value: 'REJECT',
  },
];
export const LocaleOptions = [
  {
    id: 1,
    title: 'EN',
    value: 'EN',
  },
  {
    id: 2,
    title: 'TH',
    value: 'TH',
  },
];
export const OverdueOptions = [
  {
    id: 1,
    title: getString('carepay.transaction.oneTo7'),
    value: {
      startDate: sub(new Date(), { days: 7 }),
      endDate: new Date(),
    },
  },
  {
    id: 2,
    title: getString('carepay.transaction.eightTo19'),
    value: {
      startDate: sub(new Date(), { days: 19 }),
      endDate: sub(new Date(), { days: 8 }),
    },
  },
  {
    id: 3,
    title: getString('carepay.transaction.twentyTo28'),
    value: {
      startDate: sub(new Date(), { days: 28 }),
      endDate: sub(new Date(), { days: 20 }),
    },
  },
  {
    id: 4,
    title: getString('carepay.transaction.thirtyTo39'),
    value: {
      startDate: sub(new Date(), { days: 39 }),
      endDate: sub(new Date(), { days: 30 }),
    },
  },
  {
    id: 5,
    title: getString('carepay.transaction.moreThan40'),
    value: {
      startDate: sub(new Date(), { days: 365 }),
      endDate: sub(new Date(), { days: 40 }),
    },
  },
];

export const SMSScheduleOptions = [
  { id: 1, title: getString('text.no'), value: 'false' },
  { id: 2, title: getString('text.yes'), value: 'true' },
];

export const OpnAccountRecipientOptions = [
  { id: 1, title: 'KBANK', value: 'KASIKORN' },
  { id: 2, title: 'KTB', value: 'KRUNGTHAI' },
  { id: 3, title: 'SCB', value: 'SCB' },
  { id: 4, title: 'BBL', value: 'BANGKOK_BANK' },
  { id: 5, title: 'BAY', value: 'KRUNGSRI' },
  { id: 6, title: 'TTB', value: 'TMB_BANK' },
  { id: 7, title: 'UOB', value: 'UOB' },
];
export const PaymentLinkStatusOptions = [
  {
    id: 1,
    title: getString('statusOptions.active'),
    value: 'ACTIVE',
  },
  {
    id: 2,
    title: getString('menu.carePay.canceled.main'),
    value: 'CANCELED',
  },
];
export const PaymentTransactionStatusOptions = [
  {
    id: 1,
    title: getString('menu.carePay.pending'),
    value: 'PENDING',
  },
  {
    id: 3,
    title: getString('menu.carePay.overdue'),
    value: 'OVERDUE',
  },
  {
    id: 4,
    title: getString('menu.carePay.paid'),
    value: 'PAID',
  },
  {
    id: 7,
    title: getString('menu.carePay.canceled.main'),
    value: 'CANCELLED',
  },
];

export const getFilterFields = (agentList: any) => [
  ...fields,
  {
    InputComponent: Controls.Autocomplete,
    inputProps: {
      name: 'salesAgents',
      label: getString('carepay.transaction.assignToUser'),
      options: agentList,
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
      name: 'overdue',
      label: getString('carepay.transaction.overdue'),
      options: OverdueOptions,
      filterType: 'detail',
      fixedLabel: true,
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
  {
    InputComponent: Controls.Checkbox,
    inputProps: {
      name: 'showDeleted',
      label: getString('carepay.transaction.showDeleted'),
      filterType: 'detail',
      fixedLabel: true,
      className: 'justify-end',
      responsive: {
        xs: 6,
        md: 3,
      },
    },
  },
];

export const formatFilterURI = (payload: any) => {
  let url = '';
  const {
    search,
    paymentStatus,
    paymentMethod,
    paymentOption,
    salesAgents,
    overdue,
    showDeleted,
  } = payload;

  if (search) {
    if (search.customerName) {
      url += transformUrlQuerySearch(
        url,
        {
          ...search,
          selectValue: 'attributes.lead.customerFullName',
        },
        ':'
      );
    } else if (search?.['attributes.customerPhone']?.includes('+')) {
      url += transformUrlQuerySearch(url, {
        ...search,
        selectValue: 'attributes.lead.customerPhone',
        inputValue: search.inputValue.replace('+', ''),
      });
    } else {
      url += transformUrlQuerySearch(url, search);
    }
  }
  const dateBetweens = [];
  if (payload.date.startDate.criteria) {
    const value = payload.date.startDate.range;
    dateBetweens.push({ name: payload.date.startDate.criteria, value });
  }
  if (payload.date.endDate.criteria) {
    const value = payload.date.endDate.range;
    dateBetweens.push({ name: payload.date.endDate.criteria, value });
  }
  dateBetweens.forEach(({ name, value }) => {
    if (value) url += transformUrlQueryDateBetween(url, value, name);
  });
  if (overdue) {
    overdue.forEach(
      (dateRange: { value: { startDate: Date; endDate: Date } }) => {
        if (dateRange?.value)
          url += transformUrlQueryDateBetween(
            url,
            dateRange.value,
            'followups[].followup.dueDate'
          );
      }
    );
  }

  const multiSelect = [
    {
      value: paymentOption.map((option: any) => ({
        ...option,
        value: option.value.replace('_DEBIT', ''),
      })),
      fieldName: 'transaction.paymentOption.keyword',
    },
    {
      value: paymentStatus,
      fieldName: 'transaction.statusCode',
    },
    {
      value: paymentOption.find(
        (option: any) => option.value === 'RABBIT_CARE_INSTALLMENT_DEBIT'
      )
        ? [
            ...paymentMethod.filter(
              (method: any) => method.value !== 'DIRECT_DEBIT'
            ),
            {
              value: 'DIRECT_DEBIT',
            },
          ]
        : paymentMethod,
      fieldName:
        paymentMethod &&
        paymentMethod.some((m: any) => m.value === 'CREDIT_TERM')
          ? 'transactionSnapshot.paymentMethod'
          : 'latestCharge.paymentMethod.keyword',
    },
    {
      value: salesAgents,
      fieldName: 'followups[].assignment.name',
    },
  ];
  multiSelect.forEach(({ value, fieldName }) => {
    if (value) url += transformUrlQueryMultiSelect(url, value, fieldName);
  });

  if (showDeleted) {
    url += ' transaction.deleteTime!="0001-01-01T00:00:00Z"';
  }

  return url;
};

export const initialPaymentHistoryValue = {
  credits: {
    credits: [],
  },
  refunds: {
    refunds: [],
  },
  charges: {
    charges: [],
  },
};

const getTranslatedStatusValue = (status: string) => {
  switch (status) {
    case 'STATUS_USED':
      return getString('paymentStatus.used');
    case 'STATUS_PENDING':
    case 'PENDING':
      return getString('paymentStatus.pending');
    case 'STATUS_SUCCESSFUL':
    case 'SUCCESSFUL':
      return getString('paymentStatus.successful');
    default:
      return status;
  }
};
export const formatPaymentHistoryResponse = (
  type: 'charge' | 'refund' | 'credit',
  data: any[]
) => {
  if (!data?.length) return [];
  switch (type) {
    case 'charge': {
      const slipPayments = [
        'DIRECT_PAYMENT',
        'EDC',
        'BANK_TRANSFER',
        'CASH',
        'VEDC',
      ];
      return data.map((charge: ChargeResponse) => ({
        paymentProviderId: slipPayments.includes(charge.paymentMethod)
          ? '-'
          : charge.thirdPartyId,
        paymentMethodText: getString(`paymentMethods.${charge.paymentMethod}`),
        paymentLinkStatus: charge.status === 'pending' ? 'ACTIVE' : '-',
        amount: numberToMoney(satangToBahtNumber(charge.money.amount)),
        omiseDate: charge.createTime,
        chargeId: `charges/${charge.name.split('/').slice(-1)}`,
        createdOn: formatDate(charge.createTime, 'dd/MM/yyyy') ?? '',
        updatedOn: formatDate(charge.updateTime, 'dd/MM/yyyy') ?? '',
        paymentStatus: getTranslatedStatusValue(charge.status),
        installmentPlan: charge.installmentNumber,
        slipIdResource: charge?.slipIdResource ?? '',
        paymentDate: charge?.paymentDate ?? '',
        money: charge.money,
        createTime: charge.createTime,
        updateTime: charge.updateTime,
        paymentMethod: charge.paymentMethod,
      }));
    }
    case 'credit': {
      return data?.map((credit: any) => ({
        slipIdResource: credit?.slipIdResource ?? '',
        creditId: `credits/${credit.name.split('/')[3]}`,
        amount: numberToMoney(satangToBahtNumber(credit.money.amount)),
        status: getTranslatedStatusValue(credit.status),
        updatedOn: formatDate(credit.updateTime, 'dd/MM/yyyy') ?? '',
        createdOn: formatDate(credit.createTime, 'dd/MM/yyyy') ?? '',
      }));
    }
    case 'refund':
      return data?.map((refund: any) => ({
        slipIdResource: refund?.slipIdResource ?? '',
        refundId: `refunds/${refund.name.split('/')[3]}`,
        refundAmount: numberToMoney(satangToBahtNumber(refund.money.amount)),
        status: getTranslatedStatusValue(refund.status),
        updatedOn: formatDate(refund.updateTime, 'dd/MM/yyyy') ?? '',
        createdOn: formatDate(refund.createTime, 'dd/MM/yyyy') ?? '',
      }));
    default: {
      return [];
    }
  }
};
