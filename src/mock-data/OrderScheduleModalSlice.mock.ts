import { format, addDays } from 'date-fns';
import { range } from 'lodash';

export const generateMockFeatureDate = (i: number) =>
  format(addDays(new Date(), i), 'yyyy-MM-dd');

export const generateMockCalendarDate = () =>
  range(6).map((i) => generateMockFeatureDate(i));

export const mockDates: string[] = generateMockCalendarDate();
export const mockTomorrow: string = generateMockFeatureDate(1);
export const tomorrowDate: number = addDays(new Date(), 1).getDate();
export const mockDays: Record<string, any> = mockDates.map((date) => {
  const standardlizeDays = {
    date,
    start: `${date}T09:00:00.000Z`,
    end: `${date}T20:00:00.000Z`,
    slots: [3, 6, 9, 12, 15],
    events: [] as Record<string, any>[],
    schedule: [] as Record<string, any>[],
  };
  if (date === mockTomorrow) {
    standardlizeDays.events = [
      {
        name: 'calendars/ea08495b-b907-4d8e-b6a6-c0866d312b36/events/39bfb140-c924-4897-b61c-e09f2b04ca67',
        createTime: '2023-11-23T12:16:14.526757Z',
        updateTime: '2023-11-23T12:16:14.526757Z',
        deleteTime: null,
        createBy: 'users/ea08495b-b907-4d8e-b6a6-c0866d312b36',
        startTime: `${mockTomorrow}T09:00:00Z`,
        endTime: `${mockTomorrow}T09:03:00Z`,
        orderAppointment: {
          order: 'orders/64425fca-dc4b-40e2-91d3-54f47d4c388a',
          appointmentType: 'requested',
          subject: 'Testing notify',
          urgent: false,
          purpose: 'DOCUMENT_FOLLOW_UP',
        },
        status: '',
      },
    ];
    standardlizeDays.schedule = [
      {
        name: 'calendars/ea08495b-b907-4d8e-b6a6-c0866d312b36/events/39bfb140-c924-4897-b61c-e09f2b04ca67',
        createTime: '2023-11-23T12:16:14.526757Z',
        updateTime: '2023-11-23T12:16:14.526757Z',
        deleteTime: null,
        createBy: 'users/ea08495b-b907-4d8e-b6a6-c0866d312b36',
        startTime: `${mockTomorrow}T09:00:00Z`,
        endTime: `${mockTomorrow}T09:03:00Z`,
        orderAppointment: {
          order: 'orders/64425fca-dc4b-40e2-91d3-54f47d4c388a',
          appointmentType: 'requested',
          subject: 'Testing notify',
          urgent: false,
          purpose: 'DOCUMENT_FOLLOW_UP',
        },
        status: '',
        time: `${mockTomorrow}T09:00:00Z`,
        length: '3',
        appointment: {
          order: 'orders/64425fca-dc4b-40e2-91d3-54f47d4c388a',
          appointmentType: 'document_follow_up',
          subject: 'Testing notify',
          urgent: false,
          purpose: 'DOCUMENT_FOLLOW_UP',
        },
        isUrgent: false,
      },
    ];
  }
  return standardlizeDays;
});
