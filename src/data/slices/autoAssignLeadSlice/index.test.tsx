import { renderHook, act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';
import { AutoAssignmentLead } from 'mock-data/ImportLead.mock';

import { apiSlice } from '../apiSlice';

import {
  useLazyGetAutoAssignLeadsQuery,
  useUpdateAgentStatusMutation,
  useLazyGetAllAutoAssignLeadsQuery,
  useUpdateAutoAssignSettingsMutation,
} from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

const AutoAssignPayload = {
  autoAssignmentEnabled: false,
  premiumLeadThreshold: 0,
  numTopTier: 2,
};
const apiResponse = {
  imports: [
    {
      configId: 'configs/4c2c8abd-bb98-4da6-9fe6-4a0d1e73b3a9',
      assignedLeadCount: '2 (28.57%)',
      dailyQuota: 7,
      displayName: 'TrainingTeam',
      effectiveDate: '17/09/2022',
      email: 'Testing_00008@gmail.com',
      fullName: 'Auto Assign Test_8',
      id: 'users/edc27e3a-80c1-4d75-a3c4-b836002f967b',
      lastImport: '16/09/2022 (07:29:54 PM)',
      status: 'text.present',
      teamId: 'teams/62fd8e78-5cdf-40f3-98d3-32807de0a2df',
      tier: 'NORMAL',
      sundayAgent: '-',
    },
    {
      configId: 'configs/4c2c8abd-bb98-4da6-9fe6-4a0d1e73b3a9',
      assignedLeadCount: '2 (28.57%)',
      dailyQuota: 7,
      displayName: 'TrainingTeam',
      effectiveDate: '17/09/2022',
      email: 'Testing_00008@gmail.com',
      fullName: 'Auto Assign Test_8',
      id: 'users/edc27e3a-80c1-4d75-a3c4-b836002f967b',
      lastImport: '',
      status: 'text.present',
      teamId: 'teams/62fd8e78-5cdf-40f3-98d3-32807de0a2df',
      tier: 'NORMAL',
      sundayAgent: '-',
    },
  ],
};

describe('Testing Auto-Assign APIs ', () => {
  test('Test GetAutoAssignLeadQuery API with leads', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/autoassignments`,
        () => HttpResponse.json({})
      )
    );
    const { result } = renderHook(() => useLazyGetAutoAssignLeadsQuery({}), {
      wrapper,
    });
    const [getAutoAssignedLead] = result.current;

    await act(async () => {
      await getAutoAssignedLead({});
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual(expect.objectContaining({ imports: [] }));
    });
  });
  test('Test GetAllAutoAssignLeadQuery API with leads', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/autoassignments`,
        () =>
          HttpResponse.json({
            assignments: AutoAssignmentLead,
            total: AutoAssignmentLead.length,
          })
      )
    );
    const { result } = renderHook(() => useLazyGetAllAutoAssignLeadsQuery({}), {
      wrapper,
    });
    const [getAllAutoAssignedLead] = result.current;

    await act(async () => {
      await getAllAutoAssignedLead({});
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual(expect.objectContaining(apiResponse.imports));
    });
  });
  test('Test GetAutoAssignLeadQuery API with data response', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/autoassignments`,
        () =>
          HttpResponse.json({
            assignments: AutoAssignmentLead,
          })
      )
    );
    const { result } = renderHook(() => useLazyGetAutoAssignLeadsQuery({}), {
      wrapper,
    });
    const [getAutoAssignedLead] = result.current;

    await act(async () => {
      await getAutoAssignedLead({});
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({
        ...apiResponse,
      });
    });
  });
  test('Test GetAutoAssignLeadQuery API with pagination', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/lead-search/v1alpha1/search/autoassignments?pageSize=15&page_from=15&orderBy=config.effectiveDate desc`,
        () =>
          HttpResponse.json({
            assignments: AutoAssignmentLead,
          })
      )
    );
    const { result } = renderHook(() => useLazyGetAutoAssignLeadsQuery({}), {
      wrapper,
    });
    const [getAutoAssignedLead] = result.current;

    await act(async () => {
      await getAutoAssignedLead({
        queryParams: {
          currentPage: 2,
          pageSize: 15,
          orderBy: 'effectiveDate desc',
        },
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({
        ...apiResponse,
      });
    });
  });
  test.skip('Test SetAgentStatus API ', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/autoassign/v1alpha1/configs/edc27e3a-80c1-4d75-a3c4-b836002f967b`,
        () => HttpResponse.json({})
      )
    );
    const { result } = renderHook(() => useUpdateAgentStatusMutation({}), {
      wrapper,
    });
    const [setAgentStatus] = result.current;

    await setAgentStatus({
      id: 'configs/edc27e3a-80c1-4d75-a3c4-b836002f967b',
      absent: false,
    });

    const { isLoading, data } = result.current[1];
    await hookWaitFor(() => expect(isLoading).toBeFalsy());

    await act(async () => {
      expect(data).toEqual({});
    });
  });
  test('Test Update Auto-Assign Settings API ', async () => {
    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/autoassign/v1alpha1/parameters`,
        () =>
          HttpResponse.json({
            success: true,
          })
      )
    );
    const { result } = renderHook(
      () => useUpdateAutoAssignSettingsMutation({}),
      {
        wrapper,
      }
    );
    const [updateSettings] = result.current;
    await act(async () => {
      await updateSettings(AutoAssignPayload);
    });

    const { isLoading, data } = result.current[1];
    await hookWaitFor(() => expect(isLoading).toBeFalsy());

    expect(data).toEqual({ success: true });
  });
});
