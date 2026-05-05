import { waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { of } from 'rxjs';

import { render, screen } from '__tests__/rtl-test-utils';

import OrderScheduleModal from './index';

var mockStore = configureMockStore();

var mockGetOrder = () =>
  of({
    data: {
      name: 'orders/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
      customer: '',
      supervisor: 'customers/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
      convertBy: 'customers/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
    },
  });

var mockGetOrderOnce = () =>
  of({
    data: {
      name: 'orders/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
      customer: 'customers/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
      supervisor: 'customers/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
      convertBy: 'customers/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
    },
  });

var mockGetCustomer = () =>
  of({
    data: {
      name: 'customers/69d22bc3-afd7-49e7-9a66-c1fa1e6a1650',
      firstName: 'John',
      lastName: 'Doe',
    },
  });

jest.mock('data/gateway/api/services/order', () =>
  jest
    .fn(() => ({
      getOrder: mockGetOrder,
    }))
    // Mock for first call
    .mockImplementationOnce(() => ({
      getOrder: mockGetOrderOnce,
    }))
);

jest.mock('data/gateway/api/services/customer', () =>
  jest.fn().mockImplementation(() => ({
    getCustomer: mockGetCustomer,
  }))
);

// Calendar can't show previous dates, need to generate dates from today onward.
const generateMockCalendarDate = () => {
  const date = new Date();
  const dayLength = 6;
  const days = [];

  for (let i = 0; i < dayLength; i += 1) {
    date.setDate(date.getDate() + 1);

    days.push(
      `${date.getFullYear()}-${`0${date.getMonth()}`.slice(
        -2
      )}-${`0${date.getDate()}`.slice(-2)}`
    );
  }

  return days;
};

const mockDays = generateMockCalendarDate();

const mockSchedule = (date: string) => [
  {
    name: 'calendars/be9bd8fe-2193-41f1-8c24-a7e1417f38ff/events/04d52cbe-4de9-4a9d-91fd-f65a7f2e5005',
    createTime: '2021-10-01T02:30:20.726894Z',
    updateTime: '2021-10-01T02:30:20.726894Z',
    deleteTime: null,
    createBy: 'users/be9bd8fe-2193-41f1-8c24-a7e1417f38ff',
    startTime: `${date}T09:30:00Z`,
    endTime: `${date}T09:39:00Z`,
    orderAppointment: {
      order: 'orders/8fea9134-3fd6-47ae-873f-cddcfd962110',
      appointmentType: 'wrong_document',
      subject: 'bbb',
      urgent: true,
      purpose: 'WRONG_DOCUMENT',
    },
    time: `${date}T09:30:00Z`,
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
];

const mockAppointmentData = {
  start: mockDays[0],
  length: 6,
  days: [
    {
      date: mockDays[0],
      start: '09:00',
      end: '20:00',
      slots: [3, 6, 9, 12, 15],
      schedule: mockSchedule(mockDays[0]),
    },
    {
      date: mockDays[1],
      start: '09:00',
      end: '20:00',
      slots: [3, 6, 9, 12, 15],
      schedule: mockSchedule(mockDays[1]),
    },
    {
      date: mockDays[2],
      start: '09:00',
      end: '20:00',
      slots: [3, 6, 9, 12, 15],
      schedule: mockSchedule(mockDays[2]),
    },
    {
      date: mockDays[3],
      start: '09:00',
      end: '20:00',
      slots: [3, 6, 9, 12, 15],
      events: [],
      schedule: [],
    },
    {
      date: mockDays[4],
      start: '09:00',
      end: '20:00',
      slots: [3, 6, 9, 12, 15],
      events: [],
      schedule: [],
    },
    {
      date: mockDays[5],
      start: '09:00',
      end: '20:00',
      slots: [3, 6, 9, 12, 15],
      events: [],
      schedule: [],
    },
  ],
};

const initialState = {
  order: {
    payload: {
      name: 'mockname',
    },
  },
  leadsDetailReducer: {
    listAppointment: {
      data: {
        loading: false,
        appointmentData: mockAppointmentData,
      },
    },
  },
};
const store = mockStore(initialState);

// FIXME
xdescribe('<OrderScheduleModal />', () => {
  const timeSlotWithEvent = '9:30';

  beforeEach(async () => {
    render(
      <Provider store={store as any}>
        <OrderScheduleModal isOpen onClose={() => undefined} />
      </Provider>
    );

    const targetDateId = `day-${mockDays[1].split('-')[2].replace(/^0/, '')}`;

    await waitFor(() => {
      // For some reason, this UI show multiple week days need to select the first day that shows on the UI.
      expect(screen.queryAllByTestId(targetDateId)[0]).toBeInTheDocument();
    });

    // Click on the day target to show list of expected time slots
    userEvent.click(screen.queryAllByTestId(targetDateId)[0]);

    await waitFor(() => {
      expect(screen.getByTestId(timeSlotWithEvent)).toBeInTheDocument();
    });

    userEvent.click(screen.getByTestId(timeSlotWithEvent));
  });

  it('can click on timeslot to see appointment detail', async () => {
    // Check if appointment-detail-popup appears on the screen
    await waitFor(() => {
      expect(
        screen.getByTestId('appointment-detail-popup')
      ).toBeInTheDocument();
    });
  });

  it('should be able to close appointment detail popup', async () => {
    await waitFor(() => {
      expect(screen.getByTestId('appointment-name')).toHaveTextContent(
        'John Doe'
      );
    });

    userEvent.click(screen.getByTestId('appointment-detail-close-icon'));

    await waitFor(() => {
      expect(
        screen.queryByTestId('appointment-detail-popup')
      ).not.toBeInTheDocument();
    });
  });
});
