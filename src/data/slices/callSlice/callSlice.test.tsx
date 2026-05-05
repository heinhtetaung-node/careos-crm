import { renderHook, act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import { basePaths, baseUrls, apiSlice } from 'data/slices/apiSlice';
import { buildUrl } from 'utils/url';

import {
  callSlice,
  useGetParticipantsQuery,
  useLazyGetParticipantsQuery,
  useGetCallStatusQuery,
  useLazyGetCallStatusQuery,
  useGetJoinTokenQuery,
  useCreateCallMutation,
  useDeleteCallMutation,
  useAddAgentToCallMutation,
  useAddLeadToCallMutation,
  type Call,
  type JoinTokenResponse,
} from './callSlice';

// Test constants
const TEST_CALL_NAME = 'calls/test-call-123';
const TEST_USER_ID = 'user-123';
const TEST_AGENT_NAME = 'users/agent-123';
const TEST_LEAD_NAME = 'leads/lead-123';
const TEST_PHONE_INDEX = 0;
const TEST_PHONE = '+1234567890';
const TEST_DATE = '2024-01-01T00:00:00Z';

// Mock data
const mockCallResponse: Call = {
  name: TEST_CALL_NAME,
  createTime: TEST_DATE,
  updateTime: TEST_DATE,
  deleteTime: null,
  createBy: TEST_USER_ID,
};

const mockParticipant = {
  name: 'participants/participant-1',
  createBy: TEST_USER_ID,
  createTime: TEST_DATE,
  deleteTime: null,
  destination: {
    lead: {
      lead: TEST_LEAD_NAME,
      phoneIndex: TEST_PHONE_INDEX,
    },
  },
  joinTime: TEST_DATE,
  outgoing: true,
  phone: TEST_PHONE,
  state: 'JOINED',
  updateTime: TEST_DATE,
};

const mockParticipantsResponse = {
  participants: [mockParticipant],
  nextPageToken: '',
};

const mockCallStatusResponse = {
  participants: [
    {
      name: mockParticipant.name,
      deleteTime: mockParticipant.deleteTime,
      destination: mockParticipant.destination,
      outgoing: mockParticipant.outgoing,
      state: mockParticipant.state,
    },
  ],
};

const mockParticipantResponse = {
  state: 'JOINED',
  name: mockParticipant.name,
};

const TEST_PARTICIPANT_NAME = 'participants/participant-1';
const mockJoinTokenResponse: JoinTokenResponse = {
  name: TEST_PARTICIPANT_NAME,
  expireTime: '2024-01-01T01:00:00Z',
  sfuUrl: 'wss://test-sfu-url.com',
  token: 'test-join-token-123',
};

// Helper functions
const buildCallEndpoint = (path: string) =>
  buildUrl(baseUrls.salesFlow, {
    path: `${basePaths.callv1}${path}`,
  });

const buildParticipantsEndpoint = (callName: string) =>
  buildCallEndpoint(`/${callName}/participants`);

const buildCallNameEndpoint = (callName: string) =>
  buildCallEndpoint(`/${callName}`);

const buildCallsEndpoint = () => buildCallEndpoint('/calls');

const buildJoinTokenEndpoint = (participantName: string) =>
  buildCallEndpoint(`/${participantName}/joinToken`);

describe('callSlice hooks', () => {
  const storeRef = setupApiStore(callSlice);
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={storeRef.store}>{children}</Provider>
  );

  beforeEach(() => {
    server.resetHandlers();
    storeRef.store.dispatch(apiSlice.util.resetApiState());
  });

  describe('useGetParticipantsQuery', () => {
    it('should fetch participants using hook', async () => {
      const endpoint = buildParticipantsEndpoint(TEST_CALL_NAME);

      server.use(
        http.get(endpoint, () => HttpResponse.json(mockParticipantsResponse))
      );

      const { result } = renderHook(
        () => useGetParticipantsQuery(TEST_CALL_NAME),
        {
          wrapper,
        }
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockParticipantsResponse);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useLazyGetParticipantsQuery', () => {
    it('should fetch participants lazily', async () => {
      const endpoint = buildParticipantsEndpoint(TEST_CALL_NAME);

      server.use(
        http.get(endpoint, () => HttpResponse.json(mockParticipantsResponse))
      );

      const { result } = renderHook(() => useLazyGetParticipantsQuery(), {
        wrapper,
      });

      const [trigger] = result.current;

      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].data).toBeUndefined();

      await act(async () => {
        await trigger(TEST_CALL_NAME);
      });

      const { isLoading, data, isSuccess } = result.current[1];

      await hookWaitFor(() => expect(isLoading).toBeFalsy());
      await waitFor(() => {
        expect(data).toEqual(mockParticipantsResponse);
        expect(isSuccess).toBe(true);
      });
    });
  });

  describe('useGetCallStatusQuery', () => {
    it('should fetch call status using hook', async () => {
      const endpoint = buildCallNameEndpoint(TEST_CALL_NAME);

      server.use(
        http.get(endpoint, () => HttpResponse.json(mockCallStatusResponse))
      );

      const { result } = renderHook(
        () => useGetCallStatusQuery(TEST_CALL_NAME),
        {
          wrapper,
        }
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockCallStatusResponse);
      expect(result.current.isSuccess).toBe(true);
    });
  });

  describe('useLazyGetCallStatusQuery', () => {
    it('should fetch call status lazily', async () => {
      const endpoint = buildCallNameEndpoint(TEST_CALL_NAME);

      server.use(
        http.get(endpoint, () => HttpResponse.json(mockCallStatusResponse))
      );

      const { result } = renderHook(() => useLazyGetCallStatusQuery(), {
        wrapper,
      });

      const [trigger] = result.current;

      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].data).toBeUndefined();

      await act(async () => {
        await trigger(TEST_CALL_NAME);
      });

      const { isLoading, data, isSuccess } = result.current[1];

      await hookWaitFor(() => expect(isLoading).toBeFalsy());
      await waitFor(() => {
        expect(data).toEqual(mockCallStatusResponse);
        expect(isSuccess).toBe(true);
      });
    });
  });

  describe('useCreateCallMutation', () => {
    it('should create a call using mutation hook', async () => {
      const endpoint = buildCallsEndpoint();

      server.use(
        http.post(endpoint, () => HttpResponse.json(mockCallResponse))
      );

      const { result } = renderHook(() => useCreateCallMutation(), {
        wrapper,
      });

      const [createCall] = result.current;

      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].data).toBeUndefined();

      await act(async () => {
        await createCall();
      });

      const { isLoading, data } = result.current[1];

      await hookWaitFor(() => expect(isLoading).toBeFalsy());
      await waitFor(() => {
        expect(data).toEqual(mockCallResponse);
      });
    });
  });

  describe('useDeleteCallMutation', () => {
    it('should delete a call using mutation hook', async () => {
      const endpoint = buildCallNameEndpoint(TEST_CALL_NAME);

      server.use(
        http.delete(endpoint, () => HttpResponse.json(null, { status: 200 }))
      );

      const { result } = renderHook(() => useDeleteCallMutation(), {
        wrapper,
      });

      const [deleteCall] = result.current;

      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].data).toBeUndefined();

      await act(async () => {
        await deleteCall(TEST_CALL_NAME);
      });

      const { isLoading, data } = result.current[1];

      await hookWaitFor(() => expect(isLoading).toBeFalsy());
      await waitFor(() => {
        expect(data).toBe(null);
      });
    });
  });

  describe('useAddAgentToCallMutation', () => {
    const mockRequest = {
      callName: TEST_CALL_NAME,
      agentName: TEST_AGENT_NAME,
    };

    it('should add agent to call using mutation hook', async () => {
      const endpoint = buildParticipantsEndpoint(mockRequest.callName);

      server.use(
        http.post(endpoint, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({
            destination: {
              user: {
                user: mockRequest.agentName,
              },
            },
            outgoing: false,
          });
          return HttpResponse.json(mockParticipantResponse);
        })
      );

      const { result } = renderHook(() => useAddAgentToCallMutation(), {
        wrapper,
      });

      const [addAgentToCall] = result.current;

      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].data).toBeUndefined();

      await act(async () => {
        await addAgentToCall(mockRequest);
      });

      const { isLoading, data } = result.current[1];

      await hookWaitFor(() => expect(isLoading).toBeFalsy());
      await waitFor(() => {
        expect(data).toEqual(mockParticipantResponse);
      });
    });
  });

  describe('useAddLeadToCallMutation', () => {
    const mockRequest = {
      callName: TEST_CALL_NAME,
      leadName: TEST_LEAD_NAME,
      phoneIndex: TEST_PHONE_INDEX,
    };

    it('should add lead to call using mutation hook', async () => {
      const endpoint = buildParticipantsEndpoint(mockRequest.callName);

      server.use(
        http.post(endpoint, async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual({
            destination: {
              lead: {
                lead: mockRequest.leadName,
                phoneIndex: mockRequest.phoneIndex,
              },
            },
            outgoing: true,
          });
          return HttpResponse.json(mockParticipantResponse);
        })
      );

      const { result } = renderHook(() => useAddLeadToCallMutation(), {
        wrapper,
      });

      const [addLeadToCall] = result.current;

      expect(result.current[1].isLoading).toBe(false);
      expect(result.current[1].data).toBeUndefined();

      await act(async () => {
        await addLeadToCall(mockRequest);
      });

      const { isLoading, data } = result.current[1];

      await hookWaitFor(() => expect(isLoading).toBeFalsy());
      await waitFor(() => {
        expect(data).toEqual(mockParticipantResponse);
      });
    });
  });

  describe('useGetJoinTokenQuery', () => {
    it('should fetch join token using hook', async () => {
      const endpoint = buildJoinTokenEndpoint(TEST_PARTICIPANT_NAME);

      server.use(
        http.get(endpoint, () => HttpResponse.json(mockJoinTokenResponse))
      );

      const { result } = renderHook(
        () => useGetJoinTokenQuery(TEST_PARTICIPANT_NAME),
        { wrapper }
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockJoinTokenResponse);
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
