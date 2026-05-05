import _get from 'lodash/get';
import _groupBy from 'lodash/groupBy';
import _omit from 'lodash/omit';
import _set from 'lodash/set';

import { format } from 'date-fns';
import { moneyToCurrency, numberToMoney, satangToBaht } from 'utils/currency';

import { getString } from 'presentation/theme/localization';
import { ShipmentProviders } from 'shared/constants/orderType';
import {
  formatBoolean,
  formatDDMMYYYY,
  formatDDMMYYYYHHMMSS,
  NewDateFormatters,
} from 'shared/helper/utilities';
import { User } from 'shared/types/user';

import { PRODUCTS } from 'config/TypeFilter';
import {
  formatApprovalStatus,
  formatDocumentStatus,
  formatOrderInsurancePackage,
  formatOrderItem,
  formatPolicyStartDate,
  formatQCStatus,
  orderInsurancePackage,
} from 'presentation/components/OrderListingTable/helper';
import {
  calculateAndFormatDiscounts,
  formatCoverage,
} from 'presentation/components/QcDetailPage/helpers/utils';
import { formatShipmentMethods } from 'presentation/pages/car-insurance/orders/PrintingAndShipping/PolicySearchSlice';

import { cancellationReasons } from 'presentation/pages/car-insurance/OrderDetailPage/helper';
import { showMoneyFromUnit } from '../shared/utils';
import {
  OrderConfigsResponse,
  OrderHistoryResponse,
  TransformedOrderConfigsResponse,
  TransformedOrderHistory,
} from './interface';

import districtArr from 'data/addresses/districts.json';
import subdistrictsArr from 'data/addresses/subdistricts.json';
import provincesArr from 'data/addresses/province.json';

type FieldName = 'deleteTime';

export const formatDeliveryOption = (data: any) => {
  switch (data?.deliveryOption) {
    case ShipmentProviders.EMAIL:
      return getString('qc.deliverByEmail');
    case ShipmentProviders.COURIER_PROVIDER_KERRY:
      return getString('qc.kerryStandard');
    case ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS:
      return getString('qc.kerryExpress');
    case ShipmentProviders.COURIER_PROVIDER_KERRY_EXPRESS_DASHCAM:
      return getString('qc.kerryExpressDashcam');
    default:
      return getString('');
  }
};

const patchResource = (
  baseResource: any,
  op: string,
  value: string,
  relativePath: string
): { oldValue: any; newValue: any } => {
  const oldValue = _get(baseResource, relativePath);
  let newValue;

  if (op === 'add' && oldValue && typeof oldValue !== 'string') {
    newValue = {
      ...oldValue,
      value,
    };
  } else {
    newValue = value;
  }
  switch (op) {
    case 'remove':
      _set(baseResource, relativePath, null);
      break;
    case 'add':
      _set(baseResource, relativePath, newValue);
      break;
    case 'replace':
      _set(baseResource, relativePath, newValue);
      break;
    default:
      break;
  }

  return { oldValue, newValue };
};

export const transformOrderResponse = (payload: OrderHistoryResponse) => {
  const response: TransformedOrderHistory[] = [];

  const { baseRecords, patches } = payload;
  const dateField = ['createTime', 'updateTime', 'deleteTime'];
  const actionTypes: Record<string, string> = {
    add: 'Add',
    replace: 'Update',
    remove: 'Remove',
  };
  const resourceType: Record<string, string> = {
    orders: 'Order',
    leads: 'Lead',
    customers: 'Customer',
    transactions: 'Payment',
  };
  const stringValue = (value?: any) => {
    if (!value) return '-';
    if (typeof value !== 'string') {
      return JSON.stringify(value);
    }
    return value;
  };
  const isDateField = (value: string) => {
    if ([...dateField, 'dateOfBirth'].includes(value)) return true;

    return value.includes('dateOfBirth');
  };
  const getResource = (value: string) => {
    const valueArray = value?.split('/');

    if (valueArray[0] === 'orders' && valueArray[2] === 'items') {
      return 'Item';
    }

    if (valueArray[0] === 'leads' && valueArray[2] === 'documents') {
      return 'Lead Document';
    }

    if (valueArray[0] === 'orders' && valueArray[2] === 'documents') {
      return 'Order Document';
    }

    return resourceType[valueArray[0]];
  };

  patches?.forEach((patch) => {
    if (!patch) return;

    const { diffs, resource, user, version } = patch;
    const { value } = diffs;
    const valueSize = value.length;

    value?.forEach((data) => {
      const { op, path, value: valueData, oldValue: apiOldValue } = data;
      const relativePath = path
        .substring(1)
        .replace('/', '.')
        .replace('/-', '');
      const fieldName = relativePath.split('.').pop() as string;
      let oldValue;

      if (op === 'replace' || op === 'remove') {
        oldValue = apiOldValue ?? _get(baseRecords[resource], relativePath);
      } else {
        oldValue = _get(baseRecords[resource], relativePath);
      }

      const { newValue } = patchResource(
        baseRecords[resource],
        op,
        valueData,
        relativePath
      );
      const timeStamp = value[valueSize - 1].value;

      function getDeleteTimeTimeStamp(_fieldName: FieldName) {
        if (_fieldName === 'deleteTime') {
          return isDateField(_fieldName)
            ? formatDDMMYYYYHHMMSS(valueData)
            : stringValue(valueData);
        }

        return formatDDMMYYYYHHMMSS(timeStamp);
      }

      const change: TransformedOrderHistory = {
        timestamp: getDeleteTimeTimeStamp(fieldName as FieldName),
        name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`,
        action: actionTypes[op],
        resource: getResource(resource),
        attribute: fieldName,
        oldValue: isDateField(fieldName)
          ? formatDDMMYYYYHHMMSS(oldValue)
          : stringValue(oldValue),
        newValue: isDateField(fieldName)
          ? formatDDMMYYYYHHMMSS(valueData)
          : stringValue(newValue),
      };

      const documentType = ['Lead Document', 'Order Document'];

      if (version !== '1' && ![...dateField, '@type'].includes(fieldName)) {
        response.push(change);
      } else if (
        (version === '1' || version === '2') &&
        ['label', 'type', 'deleteTime'].includes(fieldName) &&
        documentType.includes(getResource(resource))
      ) {
        const commonFields = {
          timestamp: getDeleteTimeTimeStamp(fieldName as FieldName),
          name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`,
          action: actionTypes[op],
          resource: getResource(resource),
        };

        const labelFields = {
          ...commonFields,
          attribute: 'label',
          oldValue: payload.baseRecords[resource].label,
          newValue: '-',
        };

        const typeFields = {
          ...commonFields,
          attribute: 'type',
          oldValue: payload.baseRecords[resource].type,
          newValue: '-',
        };

        if (fieldName === 'deleteTime') {
          response.push(labelFields);
          response.push(typeFields);
        }

        response.push(change);
      }
    });
  });

  return response;
};

export const getFormattedOrderBy: Record<string, string> = {
  status: 'config.absent',
  group: 'config.group',
  name: 'user.firstName',
  effectiveDate: 'config.effectiveDate',
  assignedOrder: 'attributes.assignedOrderCount',
};

export const getFormattedGroup: Record<string, string> = {
  QC_CASH_INSTALLMENT: 'QC: CI',
  QC_NON_CASH_INSTALLMENT: 'QC: Non-CI',
  QC_MOTORBIKE: 'QC: Motorbike',
  SUBMISSION_EMAIL: 'Submission: Email',
  SUBMISSION_WEB_PORTAL: 'Submission: Web Portal',
  SUBMISSION_BATCH_FILE: 'Submission: Batch file',
  SUBMISSION_DHIPAYA: 'Submission: Dhipaya',
  SUBMISSION_MOTORBIKE: 'Submission: Motorbike',
};

export const transformOrderConfigsResponse = (
  payload: OrderConfigsResponse['assignments']
) => {
  const result: TransformedOrderConfigsResponse['imports'] = [];

  payload.forEach((data) => {
    result.push({
      configId: data?.config?.name,
      status: data?.config?.absent
        ? getString('text.absent')
        : getString('text.present'),
      group: getFormattedGroup[data?.config?.group],
      name: `${data?.user?.firstName} ${data?.user?.lastName}`,
      effectiveDate: formatDDMMYYYY(data?.config?.effectiveDate),
      assignedOrder: data?.attributes?.assignedOrderCount,
    });
  });

  return result;
};

export const differenceInDays = (date1: string, date2: string) => {
  const diff = new Date(date2).getTime() - new Date(date1).getTime();
  return Math.ceil(diff / (1000 * 3600 * 24));
};

export const showShippingAddress = (policyHolder: any) => {
  if (!policyHolder?.shippingAddress && !policyHolder?.policyAddress) return '';

  const enTh = getString('text.yes') === 'Yes' ? 'nameEn' : 'nameTh';

  const { shippingAddress, policyAddress } = policyHolder;
  const address = policyAddress?.isShippingAddress
    ? policyAddress
    : (shippingAddress ?? policyAddress);

  return `${policyHolder?.fullName} ${address?.address} ตำบล${subdistrictsArr?.[address?.subDistrict as keyof typeof subdistrictsArr]?.[enTh]} อำเภอ${districtArr?.[address?.district as keyof typeof districtArr]?.[enTh]} จังหวัด${provincesArr?.[address?.province as keyof typeof provincesArr]?.[enTh]} รหัสไปรษณีย์ ${address?.postCode}`;
};

export const mapOrderCancellationData = (
  order: any,
  orderData: any
): Record<string, any> => {
  const { DDMMYYYY: DDMMYYYYBkk, DDMMYYYYHM } =
    NewDateFormatters('Asia/Bangkok');

  const formatMoneyOrDash = (val: any) =>
    val?.units ? numberToMoney(moneyToCurrency(val)) : '-';

  const getReason = () => {
    const id = order?.attributes?.cancellationReason;
    return cancellationReasons().find((r) => r.id === id)?.title ?? '-';
  };

  return {
    premiumRemittanceStatus: order?.accounting?.premiumRemittanceStatus ?? '-',
    cancellationStatus: order?.accounting?.cancellationStatus ?? '-',
    latestPremiumRemittanceStatusDate:
      DDMMYYYYBkk(order?.accounting?.latestPremiumRemittanceStatusTime) ?? '-',
    latestPremiumReturnStatusDate:
      DDMMYYYYBkk(order?.accounting?.latestPremiumReturnStatusTime) ?? '-',
    customerReceivePolicy: formatBoolean(
      order?.accounting?.customerReceivedPolicy,
      'Yes',
      'No'
    ),
    cancellationReason: getReason(),
    changeOrderFlag: formatBoolean(
      order?.attributes?.changeOrder,
      'TRUE',
      'FALSE'
    ),
    paymentPlan: order?.attributes?.paymentPlan ?? '-',
    paymentStatus: order?.attributes?.paymentStatus,
    actualReturnAmountFromInsurer: formatMoneyOrDash(
      order?.accounting?.actualReturnAmountInsurer
    ),
    actualReturnAmountFromRCB: formatMoneyOrDash(
      order?.accounting?.actualReturnAmountRcb
    ),
    cancellationContactDate:
      DDMMYYYYBkk(order?.accounting?.cancellationCustomerContactTime) ?? '-',
    policyEndDate: DDMMYYYYBkk(order?.accounting?.policyEndTime) ?? '-',
    bankAccountNumber: order?.accounting?.refundAccountNo ?? '-',
    bankName: order?.accounting?.refundBank ?? '-',
    policyReturnDate: DDMMYYYYBkk(order?.accounting?.policyReturnTime) ?? '-',
    cancellationContactedDate:
      DDMMYYYYBkk(order?.accounting?.cancellationInsurerContactTime) ?? '-',
    refundCalculationMethod: order?.accounting?.refundCalculationMethod ?? '-',
    actualPremiumRemittanceAmountToRCB: showMoneyFromUnit(
      order?.accounting?.actualRemittanceAmountRcb
    ),
    premiumRemittanceDateToRCB:
      DDMMYYYYBkk(order?.accounting?.remittanceRcbTime) ?? '-',
    actualPremiumRemittanceAmountToInsurer: showMoneyFromUnit(
      order?.accounting?.actualRemittanceAmountInsurer
    ),
    premiumRemittanceDateToInsurer:
      DDMMYYYYBkk(order?.accounting?.remittanceInsurerTime) ?? '-',
    premiumReturnDateFromInsurer:
      DDMMYYYYBkk(order?.accounting?.returnInsurerTime) ?? '-',
    premiumReturnDateFromRCB:
      DDMMYYYYBkk(order?.accounting?.returnRcbTime) ?? '-',
    refundAmountFromInsurer: formatMoneyOrDash(
      order?.accounting?.refundInsurerAmount
    ),
    commissionClawback: formatMoneyOrDash(
      order?.accounting?.commissionClawback
    ),
    refundAmountToCustomer: formatMoneyOrDash(
      order?.accounting?.refundAmountCustomer
    ),
    actualRefundAmountToCustomer: formatMoneyOrDash(
      order?.accounting?.actualRefundAmountCustomer
    ),
    refundDate: DDMMYYYYBkk(order?.accounting?.refundCustomerTime) ?? '-',
    lastCancellationStatusDate:
      DDMMYYYYBkk(order?.accounting?.latestCancellationStatusTime) ?? '-',
    chasisNumber: order?.attributes?.chassisNumber ?? '-',
    premiumReturnStatus: order?.accounting?.premiumReturnStatus ?? '-',
    policyNumber: order?.item?.policyNumber ?? '-',
    orderItemId: order?.item?.humanId ?? '-',
    orderItemName: order?.item?.name ?? '-',
    licensePlate: order?.attributes?.carLicensePlate ?? '-',
    orderCreated: DDMMYYYYHM(orderData?.createTime) ?? '-',
    policyStartDate: DDMMYYYYBkk(orderData?.policyStartDate) ?? '-',
    insuredPerson:
      order?.attributes?.policyHolder?.companyName ??
      `${order?.attributes?.policyHolder?.firstName} ${order?.attributes?.policyHolder?.lastName}`,
    productType: order?.item?.product ?? '-',
    customerRequest: order?.accounting?.customerRequest ?? '-',
    leadForChangeOrder: order?.accounting?.leadForChangeOrder ?? '-',
    refundRequest: order?.accounting?.refundRequest
      ? getString('text.yes')
      : getString('text.no'),
    invoicedAmount: formatCoverage(
      satangToBaht(order?.accounting?.invoicedAmount)
    ),
    urgentRefund: order?.accounting?.urgentRefund,
    urgentRefundReason: order?.accounting?.urgentRefundReason ?? '-',
    totalCancellationFee: order?.cancellationDetails?.cancellationFee
      ? numberToMoney(satangToBaht(order?.cancellationDetails?.cancellationFee))
      : '0',
    refundAccountDocument: order?.accounting?.refundAccountDocument,
    idCardDocument: order?.accounting?.idCardDocument,
    urgentRefundFormDocument: order?.accounting?.urgentRefundFormDocument,
    cancellationEmailWithInsurer:
      order?.accounting?.cancellationEmailWithInsurer,
    grossPremium: formatCoverage(satangToBaht(order?.item?.grossPremium)),
    usedCreditShell: order?.item?.creditUsed
      ? numberToMoney(moneyToCurrency(order?.item?.creditUsed))
      : '0',
  };
};

export const mapProductItems = (
  items: any[],
  latestShipments: any,
  usersMap: any,
  assignedTo: string,
  policyHolder: any
) =>
  items.map((item) => {
    const product = _omit(
      formatOrderItem(item, policyHolder),
      'trackingNumber'
    );
    const shipments = latestShipments[item.name]?.map(
      ({ shipment }: { shipment: any }) => shipment
    );
    const shipmentMethods = formatShipmentMethods(shipments);
    const policyAssignedTo = usersMap[item[assignedTo]];

    return {
      ...product,
      ...shipmentMethods,
      assignedTo: policyAssignedTo,
    };
  });

export const formatOrderResponseByType = (
  data: any[],
  {
    ...additionalInfo
  }: { assignedTo: string; type: string; usersMap: Record<string, User> }
) => {
  const { DDMMYYYY } = NewDateFormatters();
  const { assignedTo, usersMap, type } = additionalInfo;

  if (type === 'travel-allOrders') {
    return data?.map((order: any) => {
      const orderData = order?.order;
      const policyData = orderData.data.policy;
      const customerData = order?.customer;
      const tripData = orderData.data.trip;
      const insurancePackageOrPolicy = `${orderData?.data?.policy?.policyType ?? ''} ${orderData?.data?.policy?.travelType ?? ''}`;

      return {
        orderId: orderData.humanId,
        name: orderData.name,
        insurancePackage: insurancePackageOrPolicy,
        companyName: getString(
          `travel.insurer_name.${order?.items?.[0].insurer ?? ''}`
        ),
        customer:
          `${order?.customer?.firstName} ${order?.customer?.lastName}`.trim(),
        totalInvoiced: formatCoverage(
          satangToBaht(orderData.invoicePrice ?? 0)
        ),
        phoneNumber:
          order?.customerPhones?.length > 0
            ? (order?.customerPhones?.find(
                (phone: { phone: string; name: string }) =>
                  phone.name === customerData?.primaryPhoneId
              )?.phone ?? order?.customerPhones[0].phone)
            : '-',
        email:
          order?.customerEmails?.length > 0
            ? order?.customerEmails?.[0]?.email
            : '-',
        isCancelled: orderData.isCancelled || false,
        travelType: policyData?.travelPlan ?? '-',
        duration:
          differenceInDays(tripData.startDate, tripData.endDate) + 1 || '-',
        destinationCountry: tripData?.destinations?.join(' , '),
        startDate: DDMMYYYY(tripData.startDate),
        endDate: DDMMYYYY(tripData.endDate),
        orderCreated: DDMMYYYY(orderData.createTime),
        orderUpdated: DDMMYYYY(orderData.updateTime),
        lastDeliveredByEmail:
          order?.latestShipments?.length > 0
            ? DDMMYYYY(order?.latestShipments?.[0]?.shipment?.deliveryTime)
            : '-',
        childItems: orderData?.data?.travelers?.map(
          (traveller: any, index: number) => {
            const item = order?.items[index];
            return {
              orderId: orderData.humanId,
              childId: item.name,
              policy: `${orderData?.data?.policy?.policyType ?? ''} ${orderData?.data?.policy?.travelType ?? ''}`,
              policyNumber: item.policyNumber,
              policyCancellationStatus: '-',
              approvalStatus: formatApprovalStatus(item?.approvalStatus),
              policyStartDate: DDMMYYYY(item?.policyStartDate),
              insuredPerson: `${traveller?.firstName} ${traveller?.lastName}`,
              policyholderDob: DDMMYYYY(traveller?.dateOfBirth),
              policyholderGender: traveller.gender,
              policyholderIdNumber: traveller.nationalId,
              policyholderPassportNumber: traveller.passportNumber,
              policyholderTaxId: traveller.taxId,
              totalPremium: formatCoverage(satangToBaht(item.grossPremium)),
              isCancelled: item.isCancelled ?? false,
              policyDocument: '-',
              policyholderNationality: traveller.nationalityCode,
              policyholderCountry: traveller?.address?.countryCode,
            };
          }
        ),
      };
    });
  }
  return data?.map((order: any) => {
    const orderData = order?.order ?? order?.item;
    const documentStatus = formatDocumentStatus(orderData?.documentStatus);
    const latestShipments = _groupBy(order?.latestShipments, 'item');
    const orderDataAttribute = orderData?.data ?? order?.attributes;
    const isHealthProduct =
      orderData.product === PRODUCTS.HEALTH_PRODUCT_INSURANCE;

    const cancellationData =
      type === 'cancellation' ? mapOrderCancellationData(order, orderData) : {};

    const formattedOrderData = {
      ...order,
      id: orderData.name.split('/')[1] ?? '',
      orderId: orderData.humanId,
      orderCreated: orderData.createTime,
      customer:
        `${order?.customer?.firstName} ${order?.customer?.lastName}`.trim(),
      companyName: orderDataAttribute?.policyHolder?.companyName ?? '',
      isCompany: orderDataAttribute?.policyHolder?.isCompany ?? false,
      gender: orderDataAttribute?.policyHolder?.gender ?? '-',
      dob: orderDataAttribute?.policyHolder?.dateOfBirth ?? '-',
      insuredPerson: `${orderDataAttribute?.policyHolder?.firstName} ${orderDataAttribute?.policyHolder?.lastName}`,
      licensePlate: orderDataAttribute?.carLicensePlate,
      assignedTo: order[assignedTo] ?? '-',
      insurancePackage: formatOrderInsurancePackage(
        orderInsurancePackage(order?.items)
      ),
      convertBy: orderData.convertBy,
      documentStatus,
      documentsStatus: documentStatus,
      qcStatus: formatQCStatus(orderData.qcStatus),
      shipmentFee: orderDataAttribute.shipmentFee
        ? satangToBaht(orderDataAttribute.shipmentFee)
        : '-',
      policyStartDate: formatPolicyStartDate(
        order?.attributes?.earliestPolicyStartDate
      ),
      earliestPolicyStartDate: order?.attributes?.earliestPolicyStartDate
        ? format(
            new Date(order.attributes.earliestPolicyStartDate),
            'dd/MM/yyyy'
          )
        : '',
      products: mapProductItems(
        order?.items ?? [],
        latestShipments,
        usersMap,
        assignedTo,
        orderDataAttribute?.policyHolder
      ),
      deliveryOption: formatDeliveryOption(orderDataAttribute),
      timeSinceDocumentsComplete: '-',
      website: 'Motor',
      paymentTerms: 'One-time',
      paymentStatus: orderData.isFullyPaid
        ? getString('tableListing.fullyPaid')
        : getString('tableListing.notFullyPaid'),
      totalNetPremium: '2,000',
      totalInvoiced: formatCoverage(
        satangToBaht(orderData.invoicePrice ?? orderData?.price ?? 0)
      ),
      discount: calculateAndFormatDiscounts(orderData.discounts),
      isStar: false,
      isChecked: false,
      salesAgent: usersMap[orderData.convertBy] ?? 'website',
      ...cancellationData,
    };

    if (isHealthProduct && type !== 'cancellation') {
      return {
        ...formattedOrderData,
        policyStartDate: format(
          new Date(order?.items?.[0].policyStartDate),
          'dd/MM/yyyy'
        ),
        earliestPolicyStartDate: format(
          new Date(order?.items?.[0].policyStartDate),
          'dd/MM/yyyy'
        ),
        shippingAddress: showShippingAddress(orderData?.data?.policyHolder),
      };
    }

    return formattedOrderData;
  });
};
