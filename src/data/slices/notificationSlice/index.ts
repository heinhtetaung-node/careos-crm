import { NotificationListProps } from '@alphafounders/ui';

import { basePaths, apiSlice } from 'data/slices/apiSlice';
import { format, sub } from 'utils/datetime';

import { FilterListByDate, DEFAULT_PAGE_SIZE } from './helper';
import {
  NotificationListResponse,
  NotificationListPayload,
  ReadNotificationPayload,
  NotificationResponse,
} from './types';

const apiWithTabs = apiSlice.enhanceEndpoints({
  addTagTypes: ['NOTIFICATIONS'],
});

const notificationSlice = apiWithTabs.injectEndpoints({
  endpoints: (build) => ({
    getNotificationList: build.query<
      NotificationListProps,
      NotificationListPayload
    >({
      query: (payload) => ({
        url: `${basePaths.notification}/targets/${payload.user}/notifications`,
        method: 'GET',
        params: {
          filter: `inbox=true createTime>"${format(
            sub(new Date(), { days: 7 }),
            'yyyy-MM-dd'
          )}T00:00:00Z"`,
          pageFrom: payload.pageFrom,
          pageSize: payload.pageSize ?? DEFAULT_PAGE_SIZE,
          pageToken: payload.nextPageToken,
        },
      }),
      transformResponse: (response: NotificationListResponse) =>
        FilterListByDate(
          response.notifications ?? [],
          response.nextPageToken,
          response.unreadCount
        ),
      providesTags: ['NOTIFICATIONS'],
    }),
    readNotifications: build.mutation<
      NotificationResponse,
      ReadNotificationPayload
    >({
      query: (payload) => ({
        url: `${basePaths.notification}/${payload.notificationId}`,
        method: 'PATCH',
        body: {
          readTime: payload.readTime,
          type: payload.type,
        },
      }),
      invalidatesTags: ['NOTIFICATIONS'],
    }),
  }),
});

export const {
  useGetNotificationListQuery,
  useLazyGetNotificationListQuery,
  useReadNotificationsMutation,
} = notificationSlice;
