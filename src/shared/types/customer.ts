export interface Address {
  address: string;
  addressType: string;
  companyName?: string;
  district: number;
  fullName: string;
  firstName: string;
  isBillingAddress?: boolean;
  isShippingAddress?: boolean;
  lastName: string;
  postCode?: string;
  province: number;
  subDistrict: number;
  taxId?: string;
}

export interface PhoneNumber {
  phone: string;
  status: 'unverified' | 'verified';
}
