import { basePaths, apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

type ContractHistoryResponse = {
  contractRecords?: {
    createBy: string;
    createTime: string;
    document: string;
    expireTime: string;
    link: string;
    name: string;
  }[];
  contracts?: {
    createdBy: string;
    createdTime: string;
    document: string;
    expireTime: string;
    link: string;
    name: string;
  }[];
  nextPageToken: string;
  totalCount: number;
};

type ContractHistoryPayload = {
  leadId?: string;
  nextPageToken?: string;
  perPage: number;
};

const contractHistorySlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    getContractHistory: build.query<
      ContractHistoryResponse,
      ContractHistoryPayload
    >({
      query: (payload: ContractHistoryPayload) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/leads/${payload.leadId}/contract-records`,
        }),
        params: {
          pageSize: payload.perPage,
          page_token: payload.nextPageToken,
        },
      }),
    }),
    getContract: build.query<ContractHistoryResponse, { contractId: string }>({
      query: ({ contractId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.financialtransaction}/${contractId}`,
        }),
      }),
    }),
    newGetContractHistory: build.query<
      ContractHistoryResponse,
      ContractHistoryPayload
    >({
      query: (payload: ContractHistoryPayload) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.gff}/leads/${payload.leadId}/contracts`,
        }),
        params: {
          pageSize: payload.perPage,
          page_token: payload.nextPageToken,
        },
      }),
    }),
  }),
});

// eslint-disable-next-line import/prefer-default-export
export const {
  useLazyGetContractHistoryQuery,
  useLazyNewGetContractHistoryQuery,
  useGetContractQuery,
} = contractHistorySlice;
