import { NotificationTypes } from '@alphafounders/ui';
import { renderHook, act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore, hookWaitFor } from '__tests__/rtl-store';

import { formatNotificationList, FilterListByDate } from './helper';

import { apiSlice } from '../apiSlice';

import {
  useLazyGetNotificationListQuery,
  useReadNotificationsMutation,
} from './index';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: PropsWithChildren) => (
  <Provider store={storeRef.store}>{children}</Provider>
);

describe('Testing Notifications APIs ', () => {
  it('should get Notification Lists', async () => {
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/notification/v1/targets/-/notifications`,
        () => HttpResponse.json({})
      )
    );
    const { result } = renderHook(() => useLazyGetNotificationListQuery({}), {
      wrapper,
    });
    const [getNotificationList] = result.current;

    await act(async () => {
      await getNotificationList({ user: '-' });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({ older: [], today: [], total: 0 });
    });
  });
  it('should read Notification', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/notification/v1/demoID`,
        () => HttpResponse.json({})
      )
    );
    const { result } = renderHook(() => useReadNotificationsMutation({}), {
      wrapper,
    });
    const [readNotification] = result.current;

    await act(async () => {
      await readNotification({
        notificationId: 'demoID',
        readTime: '2022-11-13T00:55:43.900376885Z',
        type: NotificationTypes.LEAD_ASSIGNMENT,
      });
    });

    const { isLoading, data } = result.current[1];

    await hookWaitFor(() => expect(isLoading).toBeFalsy());
    await waitFor(() => {
      expect(data).toEqual({});
    });
  });
});
const mockNotificationList = [
  {
    name: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    createTime: '2022-11-04T09:47:22.472858Z',
    updateTime: '2022-11-04T09:47:22.472858Z',
    deleteTime: null,
    type: NotificationTypes.LEAD_ASSIGNMENT,
    payload: {
      lead: 'leads/da6b7a1c-9048-4b53-9830-026404619ef3',
    },
    inbox: true,
    readTime: null,
    nextPageToken: '',
  },
  {
    name: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    createTime: '2022-11-04T09:47:22.472858Z',
    updateTime: '2022-11-04T09:47:22.472858Z',
    deleteTime: null,
    type: NotificationTypes.APPROVAL_REQUEST,
    payload: {
      leadId: 'LA1121221',
      agent: 'Gran',
      agentTeam: 'Senior 9',
    },
    inbox: true,
    readTime: null,
    nextPageToken: '',
  },
  {
    name: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    createTime: '2022-11-10T09:47:22.472858Z',
    updateTime: '2022-11-10T09:47:22.472858Z',
    deleteTime: null,
    type: NotificationTypes.LEAD_ASSIGNMENT,
    payload: {
      lead: 'leads/da6b7a1c-9048-4b53-9830-026404619ef3',
    },
    inbox: true,
    readTime: null,
    nextPageToken: '',
  },
  {
    name: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    createTime: '2022-11-10T09:47:22.472858Z',
    updateTime: '2022-11-10T09:47:22.472858Z',
    deleteTime: null,
    type: NotificationTypes.CONTRACT_SIGNED,
    payload: {
      lead: 'leads/da6b7a1c-9048-4b53-9830-026404619ef3',
      signedOn: '2022-11-10T09:47:22.472858Z',
      customerName: 'Citra',
      leadId: 'LA12121',
    },
    inbox: true,
    readTime: null,
    nextPageToken: '',
  },
];
const mockNotificationListResponse = [
  {
    date: '04/11/2022 (04:47 PM)',
    description: null,
    details: {},
    type: 'types/leadAssignment',
    id: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    isNew: true,
    name: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    title: 'leadAssigned',
    url: 'http://localhost/leads/da6b7a1c-9048-4b53-9830-026404619ef3',
    from: '',
    to: '',
  },
  {
    date: '04/11/2022 (04:47 PM)',
    description: null,
    details: {
      agent: 'Gran',
      agentTeam: 'Senior 9',
      leadId: 'LA1121221',
    },
    from: '',
    id: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    isNew: true,
    name: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    title: '',
    to: '',
    type: 'types/discountRequestCreated',
    url: 'http://localhost/discounts/approval',
  },
  {
    date: '10/11/2022 (04:47 PM)',
    description: null,
    details: {},
    type: 'types/leadAssignment',
    id: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    isNew: true,
    name: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    title: 'leadAssigned',
    url: 'http://localhost/leads/da6b7a1c-9048-4b53-9830-026404619ef3',
    from: '',
    to: '',
  },
  {
    date: '10/11/2022 (04:47 PM)',
    description: null,
    details: {
      customerName: 'Citra',
      leadId: 'LA12121',
      signedOn: '2022-11-10T09:47:22.472858Z',
    },
    from: '',
    id: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    isNew: true,
    name: 'notifications/933515ea-46de-4e07-a92b-02f15e613ddb',
    title: '',
    to: '',
    type: 'types/contractSigned',
    url: 'http://localhost/leads/da6b7a1c-9048-4b53-9830-026404619ef3',
  },
];

describe('Testing Notification Helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('11/10/2022 (04:47:22 PM)').getTime());
  });

  it('should formatNotificationList return formated data', () => {
    expect(formatNotificationList(mockNotificationList)).toEqual(
      mockNotificationListResponse
    );
  });

  it('should FilterListByDate separate data by date', () => {
    expect(FilterListByDate(mockNotificationList, '', 2)).toEqual({
      older: [mockNotificationListResponse[0], mockNotificationListResponse[1]],
      today: [mockNotificationListResponse[2], mockNotificationListResponse[3]],
      token: '',
      total: 4,
      unRead: 2,
    });
  });
});
