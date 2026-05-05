import _get from 'lodash/get';
import _omit from 'lodash/omit';
import _upperFirst from 'lodash/upperFirst';

import { PRODUCTS } from 'config/TypeFilter';
import { PurchasingPurposes } from 'presentation/pages/car-insurance/LeadDetailsPage/CustomerSection/PolicyHolderInformation/PolicyHolderInformation.helper';
import { getString } from 'presentation/theme/localization';
import { Lead } from 'shared/types/lead';

import { OrderAddress, OrderType, PolicyAddress } from './interface';

export enum AddressUsage {
  POLICY = 'policy',
  SHIPPING = 'shipping',
  BILLING = 'billing',
}

export enum AddressType {
  PERSONAL = 'personal',
  COMPANY = 'company',
  OTHER = 'other',
}
export const AddressUsageList = [
  { id: 1, value: AddressUsage.POLICY, label: getString('text.policy') },
  { id: 2, value: AddressUsage.SHIPPING, label: getString('text.shipment') },
  { id: 3, value: AddressUsage.BILLING, label: getString('text.billing') },
];

export interface IFormDataInfo {
  addressType?: string;
  address?: string;
  province?: any;
  district?: any;
  postCode?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  taxId?: string;
  subDistrict?: any;
  fullName?: string;
}
export interface IFormDataDynamic {
  policy: IFormDataInfo;
  shipping: IFormDataInfo;
  billing: IFormDataInfo;
}

export interface IFormDataSubmit {
  policy: IFormDataInfo;
  shipping: IFormDataInfo;
  billing: IFormDataInfo;
  shipmentAddressIsSame: boolean;
  billingAddressIsSame: boolean;
}

export interface IFormData extends IFormDataDynamic {
  shipmentAddressIsSame: boolean;
  billingAddressIsSame: boolean;
}

export type IFormDataKeys = keyof IFormDataDynamic;

export const initialFormDataInfo: IFormDataInfo = {
  addressType: '',
  address: '',
  province: '',
  district: '',
  postCode: '',
  firstName: '',
  lastName: '',
  taxId: '',
  companyName: '',
  subDistrict: '',
};

const checkSamePolicy = (
  policy: IFormDataInfo,
  data: IFormDataInfo
): boolean => {
  const checkIsSame =
    policy.addressType === data.addressType &&
    policy.address === data.address &&
    policy.province === data.province &&
    policy.district === data.district &&
    policy.postCode === data.postCode &&
    policy.subDistrict === data.subDistrict;

  if (!checkIsSame) {
    return false;
  }
  if (policy.addressType === AddressType.COMPANY) {
    return checkIsSame && policy.companyName === data.companyName;
  }
  return (
    checkIsSame &&
    policy.firstName === data.firstName &&
    policy.lastName === data.lastName
  );
};

export const getDisableFieldsForPolicyAddress = (
  initialFormData: IFormDataInfo,
  currentCustomer: Lead
) => {
  switch (currentCustomer?.data?.policyHolderType) {
    case PurchasingPurposes.customerIsPolicyHolder:
      return {
        ...initialFormData,
        addressType: AddressType.PERSONAL,
        companyName: '',
        taxId: '',
        firstName: _get(currentCustomer, 'data.customerFirstName', ''),
        lastName: _get(currentCustomer, 'data.customerLastName', ''),
      };
    case PurchasingPurposes.customerIsNotPolicyHolder:
      return {
        ...initialFormData,
        addressType: AddressType.PERSONAL,
        companyName: '',
        taxId: '',
        firstName: _get(currentCustomer, 'data.policyHolderFirstName', ''),
        lastName: _get(currentCustomer, 'data.policyHolderLastName', ''),
      };
    case PurchasingPurposes.companyIsPolicyHolder:
      return {
        ...initialFormData,
        addressType: AddressType.COMPANY,
        firstName: '',
        lastName: '',
      };
    default:
      return { ...initialFormData };
  }
};

export const formatInitialFormData: (currentCustomer: any) => IFormData = (
  currentCustomer = false
) => {
  let customerPolicyAddress: IFormDataInfo = getDisableFieldsForPolicyAddress(
    initialFormDataInfo,
    currentCustomer
  );

  let isMustCheckSame = false;
  let isSameShipping = true;
  let isSameBilling = true;

  if (
    currentCustomer?.data?.customerPolicyAddress &&
    Array.isArray(currentCustomer?.data?.customerPolicyAddress) &&
    currentCustomer?.data?.customerPolicyAddress?.length > 0
  ) {
    const cpas = currentCustomer?.data?.customerPolicyAddress;
    const postCode = cpas[cpas.length - 1]?.postCode;
    customerPolicyAddress = {
      ...customerPolicyAddress,
      ...cpas[cpas.length - 1],
      postCode: postCode && postCode > -1 ? postCode : '',
    };
    isMustCheckSame = true;
  }

  let customerShippingAddress: IFormDataInfo = initialFormDataInfo;
  if (
    currentCustomer?.data?.customerShippingAddress &&
    Array.isArray(currentCustomer?.data?.customerShippingAddress) &&
    currentCustomer?.data?.customerShippingAddress?.length > 0
  ) {
    const cpss = currentCustomer?.data?.customerShippingAddress;
    customerShippingAddress = {
      ...customerShippingAddress,
      ...cpss[cpss.length - 1],
    };
    if (isMustCheckSame) {
      isSameShipping = checkSamePolicy(
        customerPolicyAddress,
        customerShippingAddress
      );
    }
  }

  let customerBillingAddress: IFormDataInfo = initialFormDataInfo;
  if (
    currentCustomer?.data?.customerBillingAddress &&
    Array.isArray(currentCustomer?.data?.customerBillingAddress) &&
    currentCustomer?.data?.customerBillingAddress?.length > 0
  ) {
    const cbas = currentCustomer?.data?.customerBillingAddress;
    customerBillingAddress = {
      ...customerBillingAddress,
      ...cbas[cbas.length - 1],
    };
    if (isMustCheckSame) {
      isSameBilling = checkSamePolicy(
        customerPolicyAddress,
        customerBillingAddress
      );
    }
  }

  return {
    policy: customerPolicyAddress,
    shipping: customerShippingAddress,
    billing: customerBillingAddress,
    shipmentAddressIsSame: isSameShipping,
    billingAddressIsSame: isSameBilling,
  };
};

export const getValueInForm = (
  data: IFormData,
  key: IFormDataKeys
): IFormDataInfo => data[key];

export const getSubmitBodyProperty = (formVal: any): IFormDataInfo => {
  const requestPayload: IFormDataInfo = {
    ...formVal,
  };
  if (requestPayload.addressType === AddressType.COMPANY) {
    delete requestPayload.firstName;
    delete requestPayload.lastName;
  } else {
    delete requestPayload.companyName;
    delete requestPayload.taxId;
  }
  return requestPayload;
};

export const getAddressSubmitBody = (
  formVal: any,
  leadId: string | undefined
) => {
  const requestPayloadPolicy = getSubmitBodyProperty(formVal?.policy);
  const requestPayloadShipping = getSubmitBodyProperty(formVal?.shipping);
  const requestPayloadBilling = getSubmitBodyProperty(formVal?.billing);

  const bodyPayload: IFormDataSubmit & { id: string } = {
    id: leadId as string,
    policy: requestPayloadPolicy,
    shipping: requestPayloadShipping,
    billing: requestPayloadBilling,
    shipmentAddressIsSame: formVal.shipmentAddressIsSame,
    billingAddressIsSame: formVal.billingAddressIsSame,
  };

  return bodyPayload;
};

// ORDER ADDRESS PAYLOAD FORMATTING
const getAllowedItems = (list: any, hasNames = false) => {
  const newList = hasNames
    ? _omit(list, [])
    : _omit(list, ['firstName', 'lastName']);
  newList.fullName = `${list.firstName} ${list.lastName}`;
  return newList;
};

const formatPayload = (
  addressType: string,
  k: string,
  v: string | number | boolean
) => {
  if (k === 'sameAsPolicyAddress') {
    return {
      op: 'add',
      path: `data/policyHolder/policyAddress/is${_upperFirst(
        addressType
      )}Address`,
      value: v,
    };
  }

  return {
    op: 'add',
    path: `data/policyHolder/${addressType}Address/${k}`,
    value: v,
  };
};

export const formatOrderAddressPayload = (
  values: any,
  orderProduct?: string
) => {
  const formattedPayload: any[] = [];
  const {
    billingAddressIsSame,
    shipmentAddressIsSame,
    billing,
    policy,
    shipping,
  } = values;
  const omitShippingFullName = orderProduct !== PRODUCTS.CAR_PRODUCT_INSURANCE;
  // Check if billing address is same as policy address
  if (billingAddressIsSame) {
    // only need isBillingAddress true in payload
    formattedPayload.push(
      formatPayload('billing', 'sameAsPolicyAddress', true)
    );
  } else {
    // otherwise, format billing address data
    policy.isBillingAddress = billingAddressIsSame;
    const billingInfo = getAllowedItems(billing, true);
    Object.entries(billingInfo).forEach(([k, v]) => {
      const value = k === 'postCode' ? Number(v) : v;
      formattedPayload.push(formatPayload('billing', k, value));
    });
  }
  // Check if shipping address is same as policy address
  if (shipmentAddressIsSame) {
    // only need isShippingAddress true in payload
    formattedPayload.push(
      formatPayload('shipping', 'sameAsPolicyAddress', true)
    );
  } else {
    // otherwise, format shipping address data
    policy.isShippingAddress = shipmentAddressIsSame;
    const shippingRaw = getAllowedItems(shipping, true);
    const shippingInfo = omitShippingFullName
      ? _omit(shippingRaw, ['fullName'])
      : shippingRaw;
    Object.entries(shippingInfo).forEach(([k, v]) => {
      const value = k === 'postCode' ? Number(v) : v;
      formattedPayload.push(formatPayload('shipping', k, value));
    });
  }
  // otherwise, format policy address data
  let policyInfo = getAllowedItems(policy);
  policyInfo = _omit(policyInfo, ['fullName']);
  Object.entries(policyInfo).forEach(([k, v]) => {
    const value = k === 'postCode' ? Number(v) : v;
    formattedPayload.push(formatPayload('policy', k, value));
  });
  return formattedPayload.filter(
    (payload) => payload.value !== undefined && payload.value !== ''
  ); // remove empty payload.
};

export const formatInitialOrderData = (order: OrderType): IFormData => {
  const firstName = _get(order, 'data.policyHolder.firstName', '');
  const lastName = _get(order, 'data.policyHolder.lastName', '');
  const companyName = _get(order, 'data.policyHolder.companyName'); // companyName should be from policyholder
  const taxId = _get(order, 'data.policyHolder.companyTaxId'); // taxId should be from policyholder

  const { isBillingAddress, isShippingAddress, ...policy } = _get(
    order,
    'data.policyHolder.policyAddress',
    {}
  ) as PolicyAddress;
  const shippingAddress = _get(
    order,
    'data.policyHolder.shippingAddress',
    {}
  ) as OrderAddress;
  const billingAddress = _get(
    order,
    'data.policyHolder.billingAddress',
    {}
  ) as OrderAddress;
  return {
    policy: {
      ...policy,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      companyName, // overwrite the companyName from policyAddress
      taxId, // overwrite the taxId from policyAddress
    },
    shipping: {
      ...shippingAddress,
      addressType: shippingAddress?.addressType || policy.addressType,
      firstName: shippingAddress?.firstName ?? '',
      lastName: shippingAddress?.lastName ?? '',
      fullName: `${shippingAddress?.firstName ?? ''} ${
        shippingAddress?.lastName ?? ''
      }`,
    },
    billing: {
      ...billingAddress,
      addressType: billingAddress?.addressType || policy.addressType,
      firstName: billingAddress?.firstName ?? '',
      lastName: billingAddress?.lastName ?? '',
      fullName: `${billingAddress?.firstName ?? ''} ${
        billingAddress?.lastName ?? ''
      }`,
    },
    shipmentAddressIsSame: isShippingAddress,
    billingAddressIsSame: isBillingAddress,
  } as IFormDataSubmit;
};
