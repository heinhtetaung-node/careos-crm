import { handleData } from './scheduleModal.helper';

const fixtureData = {
  start: '2021-10-04',
  length: 3,
  days: [
    {
      date: '2021-10-05',
      start: '2021-10-04T09:00:00.000Z',
      end: '2021-10-04T20:00:00.000Z',
      slots: [3, 6, 9, 12, 15],
      events: [
        {
          startTime: '2021-10-04T09:30:00Z',
          endTime: '2021-10-04T09:39:00Z',
          orderAppointment: {
            order: 'orders/8fea9134-3fd6-47ae-873f-cddcfd962110',
            appointmentType: 'wrong_document',
            subject: 'bbb',
            urgent: true,
            purpose: 'WRONG_DOCUMENT',
          },
        },
      ],
    },
    {
      date: '2021-10-06',
      start: '2021-10-05T09:00:00.000Z',
      end: '2021-10-05T20:00:00.000Z',
      slots: [3, 6, 9, 12, 15],
      events: [
        {
          startTime: '2021-10-05T10:21:00Z',
          endTime: '2021-10-05T10:24:00Z',
          orderAppointment: {
            order: 'orders/31fd95f0-297d-4dac-8dc0-4240c0fc344b',
            appointmentType: 'document_follow_up',
            subject: 'test',
            urgent: false,
            purpose: 'DOCUMENT_FOLLOW_UP',
          },
        },
      ],
    },
    {
      date: '2021-10-07',
      start: '2021-10-05T09:00:00.000Z',
      end: '2021-10-05T20:00:00.000Z',
      slots: [3, 6, 9, 12, 15],
      events: [
        {
          startTime: '2021-10-05T10:21:00Z',
          endTime: '2021-10-05T10:24:00Z',
          appointment: {
            lead: 'leads/31fd95f0-297d-4dac-8dc0-4240c0fc344b',
            appointmentType: 'document_follow_up',
            subject: 'test',
            payment: false,
          },
        },
      ],
    },
  ],
};

describe('handleData', () => {
  it('returns appointment data with isUrgent record', () => {
    expect(handleData(fixtureData)).toEqual({
      start: '2021-10-04',
      length: 3,
      days: [
        {
          date: '2021-10-05',
          start: '09:00',
          end: '20:00',
          slots: [3, 6, 9, 12, 15],
          events: [
            {
              startTime: '2021-10-04T09:30:00Z',
              endTime: '2021-10-04T09:39:00Z',
              orderAppointment: {
                order: 'orders/8fea9134-3fd6-47ae-873f-cddcfd962110',
                appointmentType: 'wrong_document',
                subject: 'bbb',
                urgent: true,
                purpose: 'WRONG_DOCUMENT',
              },
            },
          ],
          schedule: [
            {
              startTime: '2021-10-04T09:30:00Z',
              endTime: '2021-10-04T09:39:00Z',
              orderAppointment: {
                order: 'orders/8fea9134-3fd6-47ae-873f-cddcfd962110',
                appointmentType: 'wrong_document',
                subject: 'bbb',
                urgent: true,
                purpose: 'WRONG_DOCUMENT',
              },
              time: '2021-10-04T09:30:00Z',
              length: '9',
              appointment: {
                order: 'orders/8fea9134-3fd6-47ae-873f-cddcfd962110',
                appointmentType: 'wrong_document',
                subject: 'bbb',
                urgent: true,
                purpose: 'WRONG_DOCUMENT',
              },
              isUrgent: true,
            },
          ],
        },
        {
          date: '2021-10-06',
          start: '09:00',
          end: '20:00',
          slots: [3, 6, 9, 12, 15],
          events: [
            {
              startTime: '2021-10-05T10:21:00Z',
              endTime: '2021-10-05T10:24:00Z',
              orderAppointment: {
                order: 'orders/31fd95f0-297d-4dac-8dc0-4240c0fc344b',
                appointmentType: 'document_follow_up',
                subject: 'test',
                urgent: false,
                purpose: 'DOCUMENT_FOLLOW_UP',
              },
            },
          ],
          schedule: [
            {
              startTime: '2021-10-05T10:21:00Z',
              endTime: '2021-10-05T10:24:00Z',
              orderAppointment: {
                order: 'orders/31fd95f0-297d-4dac-8dc0-4240c0fc344b',
                appointmentType: 'document_follow_up',
                subject: 'test',
                urgent: false,
                purpose: 'DOCUMENT_FOLLOW_UP',
              },
              time: '2021-10-05T10:21:00Z',
              length: '3',
              appointment: {
                order: 'orders/31fd95f0-297d-4dac-8dc0-4240c0fc344b',
                appointmentType: 'document_follow_up',
                subject: 'test',
                urgent: false,
                purpose: 'DOCUMENT_FOLLOW_UP',
              },
              isUrgent: false,
            },
          ],
        },
        {
          date: '2021-10-07',
          start: '09:00',
          end: '20:00',
          slots: [3, 6, 9, 12, 15],
          events: [
            {
              startTime: '2021-10-05T10:21:00Z',
              endTime: '2021-10-05T10:24:00Z',
              appointment: {
                lead: 'leads/31fd95f0-297d-4dac-8dc0-4240c0fc344b',
                appointmentType: 'document_follow_up',
                subject: 'test',
                payment: false,
              },
            },
          ],
          schedule: [
            {
              startTime: '2021-10-05T10:21:00Z',
              endTime: '2021-10-05T10:24:00Z',
              time: '2021-10-05T10:21:00Z',
              length: '3',
              appointment: {
                lead: 'leads/31fd95f0-297d-4dac-8dc0-4240c0fc344b',
                appointmentType: 'document_follow_up',
                subject: 'test',
                payment: false,
              },
              isPayment: false,
            },
          ],
        },
      ],
    });
  });
});
