import { basePaths, apiSlice, baseUrls } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';
import type {
  AddAgentToCall,
  AddLeadToCall,
  CallResponse,
} from 'careos-call/src/api/types';

export interface Call {
  name: string;
  createTime: string;
  updateTime: string;
  deleteTime: string | null;
  createBy: string;
}

export interface JoinTokenResponse {
  name: string;
  expireTime: string;
  sfuUrl: string;
  token: string;
}

export const callSlice = apiSlice.injectEndpoints({
  endpoints: (build) => ({
    createCall: build.mutation<Call, void>({
      query: () => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.callv1}/calls`,
        }),
        method: 'POST',
      }),
    }),
    deleteCall: build.mutation<void, string>({
      query: (callName: string) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.callv1}/${callName}`,
        }),
        method: 'DELETE',
      }),
    }),
    getParticipants: build.query<any, string>({
      query: (callName: string) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.callv1}/${callName}/participants`,
        }),
      }),
    }),
    getCallStatus: build.query<CallResponse, string>({
      query: (callName: string) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.callv1}/${callName}`,
        }),
      }),
    }),
    addAgentToCall: build.mutation<
      { state: string; name: string },
      AddAgentToCall
    >({
      query: (request: AddAgentToCall) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.callv1}/${request.callName}/participants`,
        }),
        method: 'POST',
        body: {
          destination: {
            user: {
              user: request.agentName,
            },
          },
          outgoing: false,
        },
      }),
    }),
    addLeadToCall: build.mutation<
      { state: string; name: string },
      AddLeadToCall
    >({
      query: (request: AddLeadToCall) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.callv1}/${request.callName}/participants`,
        }),
        method: 'POST',
        body: {
          destination: {
            lead: {
              lead: request.leadName,
              phoneIndex: request.phoneIndex,
            },
          },
          outgoing: true,
        },
      }),
    }),
    getJoinToken: build.query<JoinTokenResponse, string>({
      query: (participantName: string) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.callv1}/${participantName}/joinToken`,
        }),
      }),
    }),
  }),
});

export const {
  useGetParticipantsQuery,
  useLazyGetParticipantsQuery,
  useGetCallStatusQuery,
  useLazyGetCallStatusQuery,
  useGetJoinTokenQuery,
  useLazyGetJoinTokenQuery,
  useCreateCallMutation,
  useDeleteCallMutation,
  useAddAgentToCallMutation,
  useAddLeadToCallMutation,
} = callSlice;
