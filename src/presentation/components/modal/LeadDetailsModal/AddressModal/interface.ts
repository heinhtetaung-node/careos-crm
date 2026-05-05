export interface OrderAddress {
  address: string;
  addressType: string;
  district: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  postCode: string;
  province: string;
  subDistrict: string;
}
export interface PolicyAddress extends OrderAddress {
  isBillingAddress: boolean;
  isShippingAddress: boolean;
}
export interface PolicyHolder {
  billingAddress: OrderAddress;
  communicationLanguage: string;
  companyName: string;
  companyTaxId: string;
  dateOfBirth: string;
  firstName: string;
  gender: string;
  isCompany: boolean;
  isCustomer: boolean;
  lastName: string;
  nationalID: string;
  policyAddress: PolicyAddress;
  shippingAddress: OrderAddress;
  title: string;
}

interface OrderData {
  policyHolder: PolicyHolder;
}

interface CustomerData {
  firstName: string;
  lastName: string;
}
export interface OrderType {
  data: OrderData;
  customer: CustomerData;
}
