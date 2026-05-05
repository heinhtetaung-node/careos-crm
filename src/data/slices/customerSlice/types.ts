import { CustomerResponse } from '../leadSlice/types';

export interface GetConnectedLeadPayload {
  leadId: string;
  currentCustomer: any;
}
export interface LeadConnectPayload {
  customerId: string;
  lead: string;
}

export interface EmailResponse {
  name: string;
  createTime: string;
  updateTime: string | null;
  deleteTime: string | null;
  email: string;
}

export interface GetUserPayload {
  phones: PhoneResponse[];
}

export interface GetEmailPayload {
  customerId: string;
  currentCustomer?: {
    data: {
      customerEmail: string[];
    };
  };
}

export interface GetConnectedLeadResponse {
  message?: string;
  leads: any[] | null;
  success?: any;
  error?: any;
  isModal: boolean | null;
  modalId?: string;
  customer?: CustomerLeadResponse | null;
  hasLead?: boolean;
}

export interface GetEmailResponse {
  all?: EmailResponse[];
  emails: EmailResponse[];
  allEmails?: string[];
}

export interface APIResponse {
  isSuccess?: boolean;
  data?: any;
  isError?: boolean;
}

export interface GetUserResponse {
  customers?: CustomerResponse[];
}

export interface CustomerLeadResponse {
  name: string;
  createTime: string;
  updateTime: null | string;
  deleteTime: null | string;
  humanId?: string;
  createBy: string;
  firstName?: string;
  lastName?: string;
  lead?: string;
}
export interface NewCustomerPayload {
  name?: string;
  firstName?: string;
  lastName?: string;
  primaryPhoneId?: string;
  createBy?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface GetCustomerPhoneNumberPayload {
  customerName: string;
  filter?: string;
}

export interface PhoneResponse {
  isPrimary?: boolean;
  name: string;
  createTime: string;
  updateTime: string | null;
  deleteTime: string | null;
  phone: string;
}

export interface UpdateCustomerPayload {
  customerId: string;
  payload: NewCustomerPayload;
}
export interface CustomerPhoneResponse {
  phones: PhoneResponse[];
}

export interface TransformedOrder {
  orderId: string;
  paymentStatus: string;
  carPlate: string;
  totalInvoice: number;
}
export interface CustomerContactInformation {
  phones: PhoneResponse[];
  emails: EmailResponse[];
}

export interface CustomerProfileResponse {
  customerProfiles: {
    customer: CustomerResponse;
    emails: EmailResponse[];
    phones: PhoneResponse[];
  }[];
  total: number;
}

export interface TransformedCustomerProfiles {
  imports: {
    id: string;
    customerID: string;
    name: string;
    phoneNumber: string;
    email: string;
    createdOn?: string;
  }[];
  total: number;
}
