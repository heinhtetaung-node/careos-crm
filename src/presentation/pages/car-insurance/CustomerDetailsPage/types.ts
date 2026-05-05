import { AnyObject } from 'yup';

import {
  CustomerContactInformation,
  CustomerLeadResponse,
  TransformedOrder,
} from 'data/slices/customerSlice/types';

export interface ICustomerSectionProps {
  leads: CustomerLeadResponse[];
  orders: TransformedOrder[];
  styles: AnyObject;
  dataSchema: FormType;
  contacts?: CustomerContactInformation | null;
  refetchContacts?: () => void;
}
export interface IDataProps {
  name: string;
}
export interface ICarDataProps {
  brand: string;
  model: string;
}
export interface IRenderSectionProps {
  type: string;
  styles: AnyObject;
  leads: IDataProps[];
  contacts: CustomerContactInformation | null;
  orders: TransformedOrder[];
  dataSchema: FormType;
}

export interface ILeadSectionProps {
  leads: IDataProps[];
  classes: AnyObject;
}
export interface IOrderSectionProps {
  orders: TransformedOrder[];
  classes: AnyObject;
}

export interface LeadDataType {
  id: string;
  name: string;
  user: string;
  type: string;
  status: string;
  brand: string;
  model: string;
  deleteTime: string;
  updateTime: string;
}

export interface OrderDataType {
  id: string;
  name: string;
  type: string;
  payment?: string;
  invoicePrice?: string;
  approvalStatus?: string;
  documentStatus?: string;
  submissionStatus?: string;
  deleteTime?: string | null;
  createTime?: string | null;
}
export interface IAccordionListProps {
  id: string;
  name: string;
  data: AnyObject;
  classes: AnyObject;
  isLoading: boolean;
  FILTERED_DETAILS: string[];
  expanded: string | false;
  handleExpand: (id: string | false) => void;
  handleGetSelectedData: (id: string) => void;
}
interface CustomerFormValueType {
  value: string | undefined;
  isEditable: boolean;
  editType: string;
  title: string;
  id: string;
  isError: boolean;
  name: string;
  disabled?: boolean;
  isRequired: boolean;
  options?: {
    name?: string;
    title: string;
    value?: string;
    id?: number;
    val?: string;
  }[];
}
export interface CustomerFormType {
  humanId: CustomerFormValueType;
  firstName: CustomerFormValueType;
  lastName: CustomerFormValueType;
  gender: CustomerFormValueType;
  DOB: CustomerFormValueType;
  phones?: CustomerFormValueType;
}
export interface FormType {
  customer: CustomerFormType;
}
