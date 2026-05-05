import { baseUrls, basePaths, apiSlice } from 'data/slices/apiSlice';
import { format } from 'utils/datetime';
import { buildUrl } from 'utils/url';

import { CommonAPIResponse } from '../types';

export type AddAppointmentPayload = {
  userId: string;
  payload: {
    startTime: string;
    endTime: string;
    appointment?: {
      appointmentType?: string;
      lead?: string;
      payment?: boolean;
      subject?: string;
    };
    orderAppointment?: {
      subject?: string;
      order?: string;
      appointmentType?: string;
      purpose?: string;
      urgent?: any;
    };
  };
};

type UpdateAppointmentPayload = {
  eventName: string;
  payload: {
    status: 'CALLED';
    appointment: any;
  };
  mask: string[];
};

type DeleteAppointmentParams = {
  userId: string;
  appointmentId: string;
};

type GetAppointmentQueryParams = {
  startDate?: string;
  days?: number;
  filter?: string;
};

type GetAppointmentResponse = {
  start: string;
  length: number;
  days: {
    date: string;
    end: string;
    events: any[];
    slots: number[];
  }[];
};

interface Appointment extends CommonAPIResponse {
  name: string;
  startTime: string;
  endTime: string;
  status: string;
  appointment: {
    lead: string;
    appointmentType: string;
    payment: boolean;
    subject: string;
  };
}

type TodayAppointmentResponse = Array<Appointment>;

type TodayAppointmentQuery = {
  resource: string;
  createBy: string;
  startTime: Date;
  endTime: Date;
};

const apiWithTag = apiSlice.enhanceEndpoints({ addTagTypes: ['APPOINTMENT'] });

const appointmentSlice = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    addAppointment: builder.mutation<any, AddAppointmentPayload>({
      query: ({ userId, payload }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.calendar}/calendars/${userId}/events`,
        }),
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['APPOINTMENT'],
    }),

    updateAppointment: builder.mutation<any, UpdateAppointmentPayload>({
      query: ({ eventName, payload, mask }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.calendar}/${eventName}`,
        }),
        method: 'PATCH',
        body: payload,
        params: {
          updateMask: mask,
        },
      }),
      invalidatesTags: ['APPOINTMENT'],
    }),

    getAppointments: builder.query<
      GetAppointmentResponse,
      GetAppointmentQueryParams
    >({
      query: (queryParams) => ({
        url: buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }),
        params: { days: 6, ...queryParams },
      }),
      transformResponse: (response: any) => response.data,
    }),

    deleteAppointment: builder.mutation<any, DeleteAppointmentParams>({
      query: ({ userId, appointmentId }) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.calendar}/calendars/${userId}/events/${appointmentId}`,
        }),
        method: 'DELETE',
      }),
    }),

    getTodayAppointments: builder.query<
      TodayAppointmentResponse,
      TodayAppointmentQuery
    >({
      query: (queryParams) => ({
        url: buildUrl(baseUrls.salesFlow, {
          path: `${basePaths.calendar}/calendars/-/events`,
        }),
        params: {
          filter: `lead="${queryParams.resource}" createBy="${
            queryParams.createBy
          }" startTime>="${format(
            queryParams.startTime,
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
          )}" endTime<="${format(
            queryParams.endTime,
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
          )}"`,
          pageSize: 50,
          order_by: 'startTime',
        },
        method: 'GET',
      }),
      transformResponse: (response: { events: TodayAppointmentResponse }) =>
        response.events,
      providesTags: ['APPOINTMENT'],
    }),
  }),
});

export const {
  useLazyGetAppointmentsQuery,
  useAddAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
  useGetTodayAppointmentsQuery,
} = appointmentSlice;
