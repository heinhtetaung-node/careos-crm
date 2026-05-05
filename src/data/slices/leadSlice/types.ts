import { RootState } from 'presentation/redux/store';

export interface GetConnectedLeadPayload {
  leadId: string;
  currentCustomer: any;
}
export interface LeadConnectPayload {
  customerId: string;
  lead: string;
}

export interface GetUserPayload {
  phones: any[];
}

export interface GetEmailPayload {
  customerId: string;
  currentCustomer: any;
}

export interface GetConnectedLeadResponse {
  message?: string;
  leads: any[] | null;
  success?: any;
  error?: any;
  isModal: boolean | null;
  modalId?: string;
}

export interface GetEmailResponse {
  emails: any[];
  checkName: boolean;
}

export interface APIResponse {
  isSuccess?: any;
  data?: any;
  isError?: any;
}

export interface GetUserResponse {
  customers?: any[];
  data?: any[];
}

export interface CustomerResponse {
  name: string;
  createTime: string;
  updateTime: null | string;
  deleteTime: null | string;
  humanId: string;
  createdBy: string;
  firstName: string;
  lastName: string;
}

export interface UpdateLeadResponse {
  product: string;
  schema: string;
  data: RootState;
  source: string;
  important: true;
  assignedTo: string;
  root: string;
  reference: string;
}
