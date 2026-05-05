interface ISelect {
  id?: number;
  title?: string;
  value?: string;
}

export interface IFormValue {
  firstName: string;
  lastName: string;
  phone: string;
  product: string;
  leadSource: ISelect;
  leadType: string;
}

export interface ICreateLead {
  product: string;
  schema: string;
  type: string;
  data: {
    customerFirstName?: string;
    customerLastName: string;
    customerPhoneNumber: { phone: string; status: string }[];
    customerEmail: string[];
  };
  source: string;
}
