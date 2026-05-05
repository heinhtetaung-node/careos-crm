import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { hookWaitFor, setupApiStore } from '__tests__/rtl-store';
import getEndpoint from 'utils/endpointHelper';

import {
  pitchChecklistSlice,
  useGetPitchChecklistQuery,
  useUpdatePitchChecklistItemMutation,
} from '.';

const storeRef = setupApiStore(pitchChecklistSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

const mockedPitchChecklist = {
  name: 'leads/fakeLeadId/pitchChecklist',
  version: 'motor-v1',
  sections: [
    {
      key: 'greeting',
      labelTh: 'ทักทาย',
      labelEn: 'Greeting',
      order: 1,
      items: [
        {
          key: 'say_hello',
          checked: true,
          labelTh: 'กล่าวสวัสดี',
          labelEn: 'Say hello',
        },
      ],
    },
  ],
  stats: {
    checked: 1,
    total: 1,
  },
};

test('Testing useGetPitchChecklistQuery', async () => {
  server.use(
    http.get(
      getEndpoint('/api/lead/v1alpha2/leads/fakeLeadId/pitchChecklist'),
      () => HttpResponse.json(mockedPitchChecklist)
    )
  );

  const { result } = renderHook(
    () => useGetPitchChecklistQuery('leads/fakeLeadId'),
    {
      wrapper,
    }
  );

  await hookWaitFor(() => expect(result.current.isFetching).toBeFalsy());

  await waitFor(() => {
    expect(result.current.isError).toBeFalsy();
    expect(result.current.data).toEqual(mockedPitchChecklist);
  });
});

test('Testing useUpdatePitchChecklistItemMutation', async () => {
  const updatedPitchChecklist = {
    ...mockedPitchChecklist,
    sections: [
      {
        ...mockedPitchChecklist.sections[0],
        items: [
          {
            ...mockedPitchChecklist.sections[0].items[0],
            checked: false,
          },
        ],
      },
    ],
    stats: { checked: 0, total: 1 },
  };

  server.use(
    http.patch(
      getEndpoint(
        '/api/lead/v1alpha2/leads/fakeLeadId/pitchChecklist:updateItem'
      ),
      () => HttpResponse.json(updatedPitchChecklist)
    )
  );

  const { result } = renderHook(() => useUpdatePitchChecklistItemMutation(), {
    wrapper,
  });
  const [updatePitchChecklistItem] = result.current;

  await act(async () => {
    await updatePitchChecklistItem({
      leadName: 'leads/fakeLeadId',
      itemKey: 'say_hello',
      checked: false,
    });
  });

  const { isLoading, isError, data } = result.current[1];
  await hookWaitFor(() => expect(isLoading).toBeFalsy());

  await waitFor(() => {
    expect(isError).toBeFalsy();
    expect(data).toEqual(updatedPitchChecklist);
  });
});

test('useUpdatePitchChecklistItemMutation rejects when PATCH fails', async () => {
  server.use(
    http.patch(
      getEndpoint(
        '/api/lead/v1alpha2/leads/fakeLeadId/pitchChecklist:updateItem'
      ),
      () => new HttpResponse(null, { status: 500 })
    )
  );

  const { result } = renderHook(() => useUpdatePitchChecklistItemMutation(), {
    wrapper,
  });
  const [updatePitchChecklistItem] = result.current;

  await expect(
    act(async () => {
      await updatePitchChecklistItem({
        leadName: 'leads/fakeLeadId',
        itemKey: 'say_hello',
        checked: false,
      }).unwrap();
    })
  ).rejects.toBeDefined();

  await hookWaitFor(() => expect(result.current[1].isLoading).toBeFalsy());
});
