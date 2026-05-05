import * as CONSTANTS from 'shared/constants';
import { OrderType } from 'shared/constants/orderType';
import { IResource } from 'shared/interfaces/common/resource';

import Type from '../../type';
import { getQueryParts, buildFilter } from '../leadSearch';

export const getCallback = (key: string) => (item: Record<string, string>) =>
  item[key];

export const getAssignedParamsByOrderPage = (type: string) => {
  switch (type) {
    case OrderType.Document:
      return 'order.documentBy';
    case OrderType.QC:
      return 'order.qcBy';
    case OrderType.Approval:
      return 'items[].approvalBy';
    case OrderType.Submission:
      return 'items[].submissionBy';
    default:
      return '';
  }
};

export const getFieldFilter = (orderType: string) => {
  if (
    orderType === OrderType.Submission ||
    orderType === OrderType.Approval ||
    orderType === OrderType.PrintingAndShipping
  ) {
    return 'items[]';
  }
  return 'order';
};

export const filterMapOrderCancellation = [
  {
    filter: 'search.orderId',
    type: 'match',
    field: 'attributes.orderHumanId',
    escape: true,
  },
  {
    filter: 'search.orderItemId',
    type: 'match',
    field: 'item.humanId',
    escape: true,
  },
  {
    filter: 'search.insuredPersonName',
    type: 'match',
    field: 'attributes.customerFullName.keyword',
    escape: false,
  },
  {
    filter: 'search.licensePlate',
    type: 'match',
    field: 'attributes.carLicensePlate',
    escape: false,
  },
  {
    filter: 'search.chassisNumber',
    type: 'match',
    field: 'attributes.chassisNumber',
    escape: false,
  },
  {
    filter: 'search.policyNumber',
    type: 'match',
    field: 'item.policyNumber',
    escape: false,
  },
  {
    filter: 'search.leadForChangeOrder',
    type: 'match',
    field: 'accounting.leadForChangeOrder',
    escape: false,
  },
  {
    filter: 'paymentMethod',
    type: 'match',
    field: 'attributes.paymentMethod',
    escape: false,
  },
  {
    filter: 'premiumRemittanceStatus',
    type: 'multi',
    field: 'accounting.premiumRemittanceStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'premiumReturnStatus',
    type: 'multi',
    field: 'accounting.premiumReturnStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'cancellationStatus',
    type: 'multi',
    field: 'accounting.cancellationStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'date',
    type: 'choiceDate',
    options: [
      {
        filter: 'accounting.updateTime',
        field: `accounting.updateTime`,
      },
      {
        filter: 'item.cancelTime',
        field: `item.cancelTime`,
      },
      {
        filter: 'item.createTime',
        field: `item.createTime`,
      },
      {
        filter: 'item.policyStartDate',
        field: `item.policyStartDate`,
      },
    ],
  },
  {
    filter: 'paymentOption',
    type: 'multi',
    field: 'attributes.paymentPlan',
    callback: getCallback('value'),
  },
  {
    filter: 'paymentStatus',
    type: 'multi',
    field: 'attributes.paymentStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'productType',
    type: 'multi',
    field: 'item.product',
    callback: getCallback('value'),
  },
  {
    filter: 'insurer',
    type: 'multi',
    field: 'insurer.name',
    callback: getCallback('value'),
  },
  {
    filter: 'customerRequest',
    type: 'multi',
    field: 'accounting.customerRequest',
    callback: getCallback('value'),
  },
  {
    filter: 'refundRequest',
    type: 'multi',
    field: 'accounting.refundRequest',
    callback: getCallback('value'),
  },
  {
    filter: 'urgentRefundReason',
    type: 'multi',
    field: 'accounting.urgentRefundReason',
    callback: getCallback('value'),
  },
  {
    filter: 'urgentRefund',
    type: 'multi',
    field: 'accounting.urgentRefund',
    callback: getCallback('value'),
  },
  {
    filter: 'refundAmountFromInsurer',
    type: 'range',
    field: 'accounting.refundInsurerAmount.units',
    callback: getCallback('value'),
  },
  {
    filter: 'refundAmountToCustomer',
    type: 'range',
    field: 'accounting.refundAmountCustomer.units',
    callback: getCallback('value'),
  },
];

export const filterMap = (orderType: string) => [
  {
    filter: 'search.customerName',
    type: 'contain',
    field: 'customer.fullName',
    escape: false,
    isCustomer: true,
  },
  {
    filter: 'search.customerPhone',
    type: 'match',
    field: 'customerPhones[].phone',
    escape: true,
    isPhone: true,
  },
  {
    filter: 'search.customerEmail',
    type: 'match',
    field: 'customerEmails[].email',
    escape: true,
  },
  {
    filter: 'search.id',
    type: 'match',
    field: 'order.humanId',
  },
  {
    filter: 'source',
    type: 'multi',
    field: 'attributes.source',
    callback: getCallback('name'),
  },
  {
    filter: 'date',
    type: 'choiceDate',
    options: [
      {
        filter: 'createTime',
        field: `${getFieldFilter(orderType)}.createTime`,
      },
      {
        filter: 'updateTime',
        field: `${getFieldFilter(orderType)}.updateTime`,
      },
      { filter: 'assignTime', field: 'assigned.createTime' },
      {
        filter: 'rejectTime',
        field: `${getFieldFilter(orderType)}.rejectTime`,
      },
      { filter: 'policyStartTime', field: 'items[].policyStartDate' },
      { filter: 'policyExpiryTime', field: 'insurance.policyExpiryDate' },
      { filter: 'appointmentTime', field: 'appointments.startTime' },
      { filter: 'lastVisitedTime', field: 'appointments.lastVisitedTime' },
      { filter: 'policyCreateTime', field: 'item.createTime' },
      { filter: 'policyUpdateTime', field: 'item.updateTime' },
      { filter: 'policyStartDate', field: 'item.policyStartDate' },
      { filter: 'approvalTime', field: 'items[].approvalTime' },
    ],
  },
  {
    filter: 'date2',
    type: 'choiceDate',
    options: [
      {
        filter: 'createTime',
        field: `${getFieldFilter(orderType)}.createTime`,
      },
      {
        filter: 'updateTime',
        field: `${getFieldFilter(orderType)}.updateTime`,
      },
      { filter: 'assignTime', field: 'assigned.createTime' },
      {
        filter: 'rejectTime',
        field: `${getFieldFilter(orderType)}.rejectTime`,
      },
      { filter: 'policyStartTime', field: 'insurance.policyStartTime' },
      { filter: 'policyExpiryTime', field: 'insurance.policyExpiryTime' },
      { filter: 'appointmentTime', field: 'appointments.startTime' },
      { filter: 'lastVisitedTime', field: 'appointments.lastVisitedTime' },
      { filter: 'policyCreateTime', field: 'item.createTime' },
      { filter: 'policyUpdateTime', field: 'item.updateTime' },
      { filter: 'policyStartDate', field: 'item.policyStartDate' },
    ],
  },
  {
    filter: 'paymentType',
    type: 'multi',
    field: 'order.paymentType',
    callback: getCallback('value'),
  },
  {
    filter: 'approvalStatus',
    type: 'multi',
    field: 'items[].approvalStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'travelType',
    type: 'match',
    field: 'order.data.policy.travelPlan',
  },
  {
    filter: 'destinationCountry',
    type: 'multi',
    field: 'order.data.trip.destinations',
    callback: getCallback('value'),
  },
  {
    filter: 'paymentStatus',
    type: 'match',
    field: 'order.isFullyPaid',
  },
  {
    filter: 'insuranceCompany',
    type: 'match',
    field: 'items[].insurer',
  },
  {
    filter: 'preferredDeliveryOption',
    type: 'match',
    field: 'order.data.deliveryOption',
  },
  {
    filter: 'paymentDaysOverdue',
    type: 'range',
    field: `${getFieldFilter(orderType)}.paymentDaysOverdue`,
  },
  {
    filter: 'documentStatus',
    type: 'multi',
    field: `${getFieldFilter(orderType)}.documentStatus`,
    callback: getCallback('value'),
  },
  {
    filter: 'qcStatus',
    type: 'multi',
    field: `${getFieldFilter(orderType)}.qcStatus`,
    callback: getCallback('value'),
  },
  {
    filter: 'insuranceType',
    type: 'match',
    field: 'items[].motorItemType',
  },
  {
    filter: 'insurer',
    type: 'multi',
    field: 'items[].insurer',
    callback: getCallback('value'),
  },
  {
    filter: 'addOn',
    type: 'multi',
    field: 'items[].addonType',
    callback: getCallback('value'),
  },
  {
    filter: 'submissionStatus',
    type: 'multi',
    field: 'items[].submissionStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'approvalStatus',
    type: 'multi',
    field: 'items[].approvalStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'assignToUser',
    type: 'multi',
    field: getAssignedParamsByOrderPage(orderType),
    callback: getCallback('name'),
  },
  {
    filter: 'assignToDocumentTeam',
    type: 'multi',
    field: 'documentTeam.name',
    callback: getCallback('name'),
  },
  {
    filter: 'assignToQCTeam',
    type: 'multi',
    field: 'qcTeam.name',
    callback: getCallback('name'),
  },
  {
    filter: 'assignToSubmissionTeam',
    type: 'multi',
    field: 'submissionTeam.name',
    callback: getCallback('name'),
  },
  {
    filter: 'assignToApprovalTeam',
    type: 'multi',
    field: 'approvalTeam.name',
    callback: getCallback('name'),
  },
  // Policy fields
  // TODO: update policyHolderName field once BE is ready
  {
    filter: 'search.policyHolderName',
    type: 'contain',
    field:
      orderType === OrderType.Travel
        ? 'order.data.travelers[].fullName'
        : 'order.data.policyHolder.fullName',
    escape: false,
  },
  // TODO: update carLicensePlate field once BE is ready
  {
    filter: 'search.licensePlate',
    type: 'contain',
    field: 'order.data.carLicensePlate.text',
    escape: true,
  },
  {
    filter: 'search.chassisNumber',
    type: 'match',
    field: 'order.data.chassisNumber',
    escape: true,
  },
  {
    filter: 'search.orderId',
    type: 'match',
    field: 'item.humanId',
    escape: true,
  },
  {
    filter: 'search.policyId',
    type: 'match',
    field: 'item.humanId',
    escape: true,
  },
  {
    filter: 'search.applicationNumber',
    type: 'match',
    field: 'items[].applicationNumber',
    escape: true,
  },
  {
    filter: 'itemDocumentStatus',
    type: 'multi',
    field: 'item.documentStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'itemPrintingAndShippingStatus',
    type: 'multi',
    field: 'item.printingAndShippingStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'itemQcStatus',
    type: 'multi',
    field: 'item.qcStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'itemSubmissionStatus',
    type: 'multi',
    field: 'item.submissionStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'itemInsurer',
    type: 'multi',
    field: 'item.insurer',
    callback: getCallback('name'),
  },
  {
    filter: 'itemInsuranceType',
    type: 'multi',
    field: 'item.motorItemType',
    callback: getCallback('packageValue'),
  },
  {
    filter: 'printingPaymentStatus',
    type: 'multi',
    field: 'order.paymentStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'itemApprovalStatus',
    type: 'multi',
    field: 'item.approvalStatus',
    callback: getCallback('value'),
  },
  {
    filter: 'documentBy',
    type: 'match',
    field: 'order.documentBy',
  },
  {
    filter: 'submissionBy',
    type: 'match',
    field: 'items[].submissionBy',
  },
  {
    filter: 'salesAgents',
    type: 'multi',
    field: 'order.convertBy',
    callback: getCallback('value'),
  },
  {
    filter: 'salesAgentsTeams',
    type: 'multi',
    field: 'salesTeam.name',
    callback: getCallback('value'),
  },
];

export const getName = (name: string | any) => {
  if (typeof name === 'string') {
    return name.replace('products/', '') || 'car-insurance';
  }
  return '';
};

export const getFilter = (body: any, filters: any) => body.filters ?? filters;

const getOrdersList = (body: any, productName: string): IResource => {
  const name = getName(productName);
  const filters = buildFilter(body, filterMap(body.orderType), []);
  const queryParts = getQueryParts(
    name,
    getFilter(body, filters),
    body.pageSize,
    body.currentPage,
    body.orderBy
  );
  const path = `/${CONSTANTS.apiEndpoint.getOrdersList}?${queryParts.join(
    '&'
  )}`;

  return {
    Type: Type.Public,
    Path: path,
  };
};

const getOrdersSubmission = (body: any, productName: string): IResource => {
  const name = getName(productName);
  const filters = buildFilter(body, filterMap(body.orderType), []);

  const queryParts = getQueryParts(
    name,
    getFilter(body, filters),
    body.pageSize,
    body.currentPage,
    body.orderBy
  );
  const path = `/${CONSTANTS.apiEndpoint.getOrdersSubmission}?${queryParts.join(
    '&'
  )}`;

  return {
    Type: Type.Public,
    Path: path,
  };
};

export default { getOrdersList, getOrdersSubmission };
