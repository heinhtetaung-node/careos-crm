import { apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import { ContractStatus } from '../leadSearchSlice/types';

type CreateContractResponse = {
  contractLink: string;
};

export interface CreateContractPayload {
  installment_plan: number;
  payment_method: string;
  coverage_end_date: string;
  due_date: string;
  installment_amount: {
    first_month?: number;
    next_month?: number;
  };
  policy_holder_national_id: string;
  leadId?: string;
}

type UpdateContractPayload = {
  status: ContractStatus;
  contractId: string;
};

type AssignContractPayload = {
  user: string;
  source: string;
  kind: string;
  contractId: string;
  assignmentId?: string;
};

type UnAssignContractPayload = {
  user: string;
  kind: string;
  source: string;
  contractAssignmentId?: string;
};

const apiSliceWithTag = apiSlice.enhanceEndpoints({
  addTagTypes: ['CONTRACT'],
});

const ContractSlice = apiSliceWithTag.injectEndpoints({
  endpoints: (build) => ({
    createContract: build.mutation<
      CreateContractResponse,
      CreateContractPayload
    >({
      query: ({ leadId, ...rest }) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `/v1alpha1/leads/${leadId}/contracts`,
        }),
        method: 'POST',
        body: rest,
      }),
    }),
    updateContract: build.mutation<any, UpdateContractPayload>({
      query: ({ contractId, ...rest }) => ({
        url: buildUrl(baseUrls.goBff, {
          path: `/v1alpha1/contracts/${contractId}`,
        }),
        method: 'PUT',
        body: rest,
      }),
      invalidatesTags: ['CONTRACT'],
    }),
    getContractAssigns: build.query({
      query: ({ contractId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/assign/v1alpha1/${contractId}/assignments`,
        }),
      }),
    }),
    assignContract: build.mutation<any, AssignContractPayload>({
      query: ({ contractId, ...rest }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/assign/v1alpha1/${contractId}/assignments`,
        }),
        method: 'POST',
        body: rest,
      }),
      invalidatesTags: ['CONTRACT'],
    }),
    unassignContract: build.mutation<any, UnAssignContractPayload>({
      query: ({ contractAssignmentId, ...rest }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `/api/assign/v1alpha1/${contractAssignmentId}`,
        }),
        method: 'DELETE',
        body: rest,
      }),
      invalidatesTags: ['CONTRACT'],
    }),
  }),
});

export const {
  useCreateContractMutation,
  useUpdateContractMutation,
  useAssignContractMutation,
  useUnassignContractMutation,
  useLazyGetContractAssignsQuery,
} = ContractSlice;
