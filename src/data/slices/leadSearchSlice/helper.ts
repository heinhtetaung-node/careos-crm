import { TagDescription } from '@reduxjs/toolkit/query';

import { formatAmountToDecimal } from 'presentation/components/common/InfoPanel/Insurance/Insurance.helper';
import { PaymentTypeOptions } from 'presentation/pages/car-insurance/CarePay/common/helper';
import { getString } from 'presentation/theme/localization';
import {
  NewDateFormatters,
  formatDDMMYYYYHHMMSS,
} from 'shared/helper/utilities';
import { numberToMoney, satangToBahtNumber } from 'utils/currency';
import { PRODUCTS } from 'config/TypeFilter';

import { GenericSearchResponse, Team } from './interface';
import {
  ContractStatus,
  SearchCarePayTransactionResponse,
  SearchCarepayChargesResponse,
  SearchContractDataResponse,
} from './types';

import { SuccessfulTransactionApiResponse } from '../transactionSlice/interface';
import { ProductTypeOptions } from 'presentation/components/modal/UserModal/helper';

export const showRemark = (remark: string) => {
  if (!remark) return '-';
  if (remark.length > 50) {
    return `${remark.substring(0, 50)}...`;
  }
  return remark;
};

export const getProductType = (productType: string) => {
  switch (productType) {
    case PRODUCTS.CAR_PRODUCT_INSURANCE:
    case PRODUCTS.CAR_PRODUCT_INSURANCE.split('/')[1]:
      return 'Car Insurance';
    case PRODUCTS.HEALTH_PRODUCT_INSURANCE:
    case PRODUCTS.HEALTH_PRODUCT_INSURANCE.split('/')[1]:
      return 'Health Insurance';
    case PRODUCTS.TRAVEL_PRODUCT_INSURANCE:
    case PRODUCTS.TRAVEL_PRODUCT_INSURANCE.split('/')[1]:
      return 'Travel Insurance';
    default:
      return '';
  }
};

export const getProductTypeLocale = (productType: string) =>
  ProductTypeOptions.find((option) => option.value === productType)?.title;

const { DDMMYYYY } = NewDateFormatters();

function _getFollowupStatus(followups: { paymentStatus: string }[]) {
  if (!followups.length) return null;
  const isPending = followups.some((followup) =>
    ['PENDING', 'OVERDUE'].includes(followup.paymentStatus)
  );
  const isPaid = followups.every(
    (followup) => followup.paymentStatus === 'PAID'
  );
  const isCancelled = followups.some(
    (followup) => followup.paymentStatus === 'CANCELLED'
  );
  const isCancelledOrReject = followups.some(
    (followup) => followup.paymentStatus === 'CANCELLED_CHANGE_ORDER'
  );

  if (isPending) return 'PENDING';
  if (isPaid) return 'PAID';
  if (isCancelled) return 'CANCELLED';
  if (isCancelledOrReject) return 'CANCELLED_CHANGE_ORDER';
  return null;
}

const getTransactionStatus = (statusCode: string) => {
  if (statusCode === 'FAILED') return 'PENDING';
  return statusCode;
};

export const getProvidedTagsByType: (type: string) => TagDescription<any> = (
  type
) => {
  if (['charges', 'contracts'].includes(type)) {
    return ['CONTRACT'];
  }
  return [];
};

export const getPaymentMethod = (
  charge: { paymentMethod: string },
  transactionSnapshot?: { paymentMethod: string }
) => {
  if (transactionSnapshot?.paymentMethod)
    return getString(
      `paymentMethodsCarepay.${transactionSnapshot?.paymentMethod}`
    );

  return charge
    ? getString(`paymentMethodsCarepay.${charge?.paymentMethod}`)
    : getString('menu.carePay.unknown');
};

interface FormatResponseType {
  imports: any[];
  total: number;
}

export function getTransactionAmount(money?: {
  currencyCode: string;
  amount: string;
}) {
  if (!money || !money.amount || !money.currencyCode) return '-';
  return `${money.currencyCode} ${numberToMoney(satangToBahtNumber(money.amount))}`;
}

export function getTransactionSlipData(
  latestCharge?: SuccessfulTransactionApiResponse['latestCharge']
) {
  if (!latestCharge) return {};
  return {
    paySlipImageResource: latestCharge?.slipIdResource,
    paymentDate: latestCharge?.paymentDate,
    transactionAmount: getTransactionAmount(latestCharge?.money),
    createdDate: DDMMYYYY(latestCharge.createTime),
    updatedBy: '',
    updatedDate: DDMMYYYY(latestCharge.updateTime),
    paymentMethod: latestCharge?.paymentMethod,
  };
}

const getFormattedTransactions: (
  data: SearchCarePayTransactionResponse[],
  total: number
) => FormatResponseType = (response, total) => {
  const formattedData = response.map(
    (transaction: SearchCarePayTransactionResponse) => {
      const {
        followups,
        attributes,
        latestCharge: charge,
        transaction: transactionData,
        order: orderData,
        transactionSnapshot,
      } = transaction;

      const { leadHumanId, money, paymentOption, statusCode } = transactionData;

      const formattedFollowups = followups
        .sort(
          (a: any, b: any) => a.followup.installment - b.followup.installment
        )
        .map((followup: any) => {
          const {
            dueDate,
            createTime,
            updateTime,
            installment,
            sendSms,
            status: followUpStatus,
          } = followup.followup;

          return {
            id: leadHumanId,
            assignment: followup?.attributes?.assignment,
            childId: followup.followup.name,
            installment,
            amount: followup.charge?.money?.amount
              ? (numberToMoney(
                  satangToBahtNumber(followup.charge?.money?.amount)
                ) ?? '-')
              : getString('menu.carePay.waitingForOpenLink'),
            paymentStatus:
              followUpStatus.replace('FOLLOWUP_STATUS_', '') ?? 'PENDING',
            paymentMethod: followup.charge?.paymentMethod ?? '-',
            paymentDate: DDMMYYYY(followup.charge?.paymentDate) ?? '-',
            assignedToUser: followup?.assignment
              ? `${followup?.assignment?.firstName} ${followup?.assignment?.lastName}`
              : '-',
            dueDate: DDMMYYYY(dueDate),
            createDate: DDMMYYYY(createTime),
            updateDate: DDMMYYYY(updateTime),
            sendSms,
            shouldAskForSlip: followup.followup.charge === '',
            transactionSlipData: getTransactionSlipData(followup.charge),
            isDeleted: !!transactionData.deleteTime,
            packageId: transactionData.quote,
            transactionSnapshotPaymentMethod:
              transaction.transactionSnapshot?.paymentMethod,
          };
        });

      const data = {
        id: leadHumanId,
        leadId: transaction?.transaction?.lead,
        configId: transactionData.name,
        amount: numberToMoney(satangToBahtNumber(money.amount)),
        paymentType:
          PaymentTypeOptions.find(
            (_type) =>
              _type.value.replace('_DEBIT', '') === paymentOption &&
              _type.methods?.includes(charge?.paymentMethod)
          )?.title ??
          PaymentTypeOptions.find((_type) => _type.value === paymentOption)
            ?.title,
        paymentOption,
        shouldAskForSlip: true,
        paymentStatus: getTransactionStatus(statusCode),
        paymentMethod: getPaymentMethod(charge, transactionSnapshot),
        dueDate: '-',
        paymentDate: DDMMYYYY(charge?.paymentDate) ?? '-',
        paymentChannel: '-',
        accountRecipient: '-',
        overdue: '-',
        customerName: `${attributes.lead.customerFirstname} ${attributes.lead.customerLastname}`,
        customerPhone: attributes.lead.customerPhone,
        license: attributes.lead.carLicensePlate,
        ciTeam: '-',
        createDate: DDMMYYYY(transactionData.createTime),
        updateDate: DDMMYYYY(transactionData.updateTime),
        childItems: formattedFollowups,
        isNotSelectable: !formattedFollowups.length,
        transactionSlipData:
          !formattedFollowups.length && getTransactionSlipData(charge),
        isDeleted: !!transactionData.deleteTime,
        packageId: transactionData.quote,
        gatewayReference: transactionData.gatewayReference,
        orderId: orderData?.name,
      };
      return data;
    }
  );
  return {
    imports: formattedData,
    total,
  };
};

export const formatResponseByType = (
  type:
    | 'team'
    | 'carePayContract'
    | 'allCarePay'
    | 'carePayTransaction'
    | 'user',
  response: any
) => {
  if (type === 'team') {
    const { teams, total }: GenericSearchResponse = response;
    return {
      teams: teams.map((team: Team) => ({
        ...team,
        productName: getProductType(team?.productType),
        updateTime: DDMMYYYY(team.updateTime),
        createTime: DDMMYYYY(team.createTime),
      })),
      total,
    };
  }
  if (type === 'carePayContract' && response?.contracts) {
    const { contracts, total }: SearchContractDataResponse['data'] = response;

    const formatted = contracts.map(
      ({ contract, price, assigned, attributes, assignedTeam }) => {
        const {
          customerPhone,
          customerFullName,
          customerEmail,
          policyHolderFullName,
          leadHumanId,
        } = attributes;
        const phone = customerPhone;
        const { priceSummary, installmentDetails } = price.priceDetail;
        const [installmentDetail] = installmentDetails;

        return {
          isNotSelectable: ![
            ContractStatus.SIGNED,
            ContractStatus.PENDING,
          ].includes(contract.status),
          configId: contract.name,
          name: contract.name,
          policyHolderFullName,
          customerName: customerFullName,
          phone,
          email: customerEmail,
          leadId: leadHumanId,
          orderId: '',
          nationId: contract.customerIdCard,
          contractStatus: contract.status,
          documentIdCard: contract.documentIdCard,
          documentSignature: contract.documentSignature,
          documentCopyIdCard: contract?.documentCopyIdCard ?? '',
          QCStatus: '',
          createTime: formatDDMMYYYYHHMMSS(contract.createTime),
          installments: price.numberOfInstallments,
          installmentAmount: formatAmountToDecimal(
            satangToBahtNumber(priceSummary?.netPremiumAmount)
          ),
          firstInstallment: formatAmountToDecimal(
            satangToBahtNumber(installmentDetail?.paymentAmount)
          ),
          firstInstallmentDate: DDMMYYYY(contract.firstInstallmentDate),
          insurer: getString(
            `shortInsurers.${contract?.productType === PRODUCTS.HEALTH_PRODUCT_INSURANCE ? price?.packageResource?.healthPackage?.insurer?.split('/')?.[1] : price?.packageResource?.carPackage?.insurer?.split('/')?.[1]}`
          ),
          policyStartDate: DDMMYYYY(contract.coverageStartTime),
          policyEndDate: DDMMYYYY(contract.coverageEndTime),
          cancelStatus: '',
          salesTeam: assignedTeam?.displayName ?? '',
          assignedQC: `${assigned?.firstName ?? ''} ${assigned?.lastName ?? ''}`,
          assignedQcId: assigned ? assigned.name : undefined,
          licensePlate: attributes?.licensePlate,
          insuranceType: price?.packageResource?.carPackage?.insuranceType,
        };
      }
    );

    return {
      imports: formatted,
      total,
    };
  }
  if (type === 'allCarePay' && response?.followups) {
    const { followups, total }: SearchCarepayChargesResponse['data'] = response;
    const formattedData = followups.map((data) => {
      const { charges, followup, transaction, lead, price, ...rest } = data;
      const { installmentNumber, dueDate, createTime } = followup;
      const charge = charges.find(
        (chargeData) => chargeData.status === 'SUCCESSFUL'
      );
      const installmentDetail = price?.priceDetail?.installmentDetails.find(
        (installment) => installment.period === installmentNumber
      );
      return {
        id: transaction.leadHumanId,
        installment: installmentNumber,
        amount: installmentDetail?.paymentAmount
          ? numberToMoney(
              satangToBahtNumber(installmentDetail?.paymentAmount ?? 0)
            )
          : '-',
        status: charge?.status ?? 'PENDING',
        paymentType:
          PaymentTypeOptions.find(
            (_type) => _type.value === transaction?.paymentOption
          )?.title ?? transaction?.paymentOption,
        dueDate: DDMMYYYY(dueDate),
        paymentDate: charge?.paymentDate ? DDMMYYYY(charge?.paymentDate) : '',
        paymentChannel: charge?.serviceProvider ?? '',
        customerName: `${lead.data.customerFirstName} ${lead.data.customerLastName}`,
        customerPhone:
          lead.data.customerPhoneNumber?.[lead.data.primaryPhoneIndex ?? 0]
            ?.phone,
        license: lead?.data?.carLicensePlate ?? '',
        ciTeam: rest.team ?? '-',
        createDate: DDMMYYYY(createTime as string),
      };
    });
    return {
      imports: formattedData,
      total,
    };
  }
  if (type === 'carePayTransaction' && response?.transactions) {
    return getFormattedTransactions(response.transactions, response?.total);
  }
  if (type === 'user' && response?.users) {
    return {
      ...response,
      users: response.users.map((user: any) => ({
        ...user,
        productLabel: getProductTypeLocale(user?.product),
        product: user?.product,
      })),
    };
  }
  return response;
};
