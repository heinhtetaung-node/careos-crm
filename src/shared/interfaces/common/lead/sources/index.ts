export interface ILeadSources {
  name?: string;
  product: string;
  online: boolean;
  hidden: boolean;
  source?: string;
  medium?: string;
  campaign?: string;
  autoAssign?: boolean;
}

export interface ILeadSourcesReponse {
  name: string;
  createTime: string;
  updateTime: string;
  deleteTime: string | null;
  createBy: string;
  updateBy: string;
  product: string;
  online: boolean;
  hidden: boolean;
  source: string;
  medium: string;
  campaign: string;
  createByFirstName: string;
  createByLastName: string;
  createByFullName: string;
  updateByFirstName: string;
  updateByLastName: string;
  updateByFullName: string;
  leadCount: number;
  score: number;
}
export interface ISelect {
  id?: number;
  title?: string;
  value?: string;
}
export interface ILeadScoreResponse {
  createTime: string;
  name: string;
  score: number;
  updateTime: string;
}

export interface ICreateScore {
  name: string;
  score: number;
  sourceName?: string;
}

export interface ICreateLead {
  product: string;
  schema: string;
  data: {
    customerFirstName?: string;
    customerLastName: string;
    customerPhoneNumber: { phone: string; status: string }[];
    customerEmail: string[];
    customerPolicyAddress: string[];
    customerShippingAddress: string[];
    customerBillingAddress: string[];
  };
  source: string;
}
