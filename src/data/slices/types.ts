export interface IAuthUser {
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  humanId: string;
  product: string;
}

export interface IKratosUser {
  identity: {
    id: string;
  };
}

export type CommonAPIResponse = {
  createTime: string;
  updateTime: string;
  deleteTime?: string | null;
  createBy?: string;
};
