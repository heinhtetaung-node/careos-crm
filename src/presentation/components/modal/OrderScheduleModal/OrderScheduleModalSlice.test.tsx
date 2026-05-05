import userEvent from '@testing-library/user-event';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { Observable } from 'rxjs';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import {
  mockDates,
  mockDays,
  mockTomorrow,
  tomorrowDate,
} from 'mock-data/OrderScheduleModalSlice.mock';

import OrderScheduleModalSlice from './OrderScheduleModalSlice';

var mockAddApoinment: jest.Mock;
var mockShowError: jest.Mock;
var mockShowSuccess: jest.Mock;
var mockStore = configureMockStore();

var mockGetOrder = new Observable((subscriber) =>
  subscriber.next({
    name: 'orders/64425fca-dc4b-40e2-91d3-54f47d4c388a',
    customer: 'customers/64425fca-dc4b-40e2-91d3-54f47d4c388a',
    supervisor: 'customers/64425fca-dc4b-40e2-91d3-54f47d4c388a',
    convertBy: 'customers/64425fca-dc4b-40e2-91d3-54f47d4c388a',
  })
);

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest
    .fn()
    .mockReturnValue({ data: { role: 'roles/admin', name: 'user-1213' } }),
}));

jest.mock('data/gateway/api/services/order', () =>
  jest.fn().mockImplementation(() => ({
    getOrder: () => mockGetOrder,
  }))
);

jest.mock('utils/snackbar', () => {
  mockShowError = jest.fn();
  mockShowSuccess = jest.fn();
  return jest.fn().mockReturnValue({
    showErrorSnackbar: mockShowError,
    showSuccessSnackbar: mockShowSuccess,
  });
});

jest.mock('data/slices/leadDetailSlices/appointmentSlice', () => {
  mockAddApoinment = jest.fn().mockReturnValue([
    jest.fn().mockImplementation(() => ({
      unwrap: () => ({
        data: {
          name: 'calendars/ea08495b-b907-4d8e-b6a6-c0866d312b36/events/d692f9f8-6f91-4061-b9dc-e0e16c593d03',
          createTime: '2023-11-24T09:48:53.071971791Z',
          updateTime: '2023-11-24T09:48:53.071971791Z',
          deleteTime: null,
          createBy: 'users/ea08495b-b907-4d8e-b6a6-c0866d312b36',
          startTime: `${mockTomorrow}T09:03:00Z`,
          endTime: `${mockTomorrow}T09:06:00Z`,
          orderAppointment: {
            order: 'orders/64425fca-dc4b-40e2-91d3-54f47d4c388a',
            appointmentType: 'requested',
            subject: 'Testing appointment',
            urgent: false,
            purpose: 'WRONG_DOCUMENT',
          },
          status: '',
        },
      }),
    })),
    {
      isLoading: false,
      isSuccess: true,
      isError: false,
    },
  ]);
  return {
    ...jest.requireActual('data/slices/leadDetailSlices/appointmentSlice'),
    useLazyGetAppointmentsQuery: jest.fn().mockReturnValue([
      jest.fn(),
      {
        isUninitialized: false,
        isFetching: false,
        isSuccess: true,
        data: {
          start: mockDates[0],
          length: 6,
          days: mockDays,
        },
      },
    ]),
    useAddAppointmentMutation: mockAddApoinment,
  };
});

const initialState = {
  order: {
    payload: {
      name: 'orders/64425fca-dc4b-40e2-91d3-54f47d4c388a',
    },
  },
};
const store = mockStore(initialState);
beforeEach(async () => {
  render(
    <Provider store={store as any}>
      <OrderScheduleModalSlice isOpen onClose={() => undefined} />
    </Provider>
  );
});

test('should render schedule modal', async () => {
  const schedule = screen.getByText('text.appointmentType');
  expect(schedule).toBeInTheDocument();

  // Wait for the day tabs to appear instead of waiting for loading text that never appears
  const tomorrowTabs = await screen.findAllByTestId(`day-${tomorrowDate}`);
  expect(tomorrowTabs[0]).toBeInTheDocument();
  await userEvent.click(tomorrowTabs[0]);

  const scheduleSlot = await screen.findByTestId('9:00');
  expect(scheduleSlot).toHaveClass('default');
  await userEvent.click(scheduleSlot);

  const appointmentPopup = await screen.findByTestId(
    'appointment-detail-popup'
  );
  expect(appointmentPopup).toBeInTheDocument();
});

test.skip('should add appointment success', async () => {
  const tomorrowTabs = screen.getAllByTestId(`day-${tomorrowDate}`);
  expect(tomorrowTabs[0]).toBeInTheDocument();
  await userEvent.click(tomorrowTabs[0]);

  const appointmentType = screen.getByTestId('muiSelect-type')
    ?.firstChild as HTMLElement;
  expect(appointmentType).toBeInTheDocument();
  await userEvent.click(appointmentType);

  const appointmentOption = await screen.findAllByRole('option');
  expect(appointmentOption).toHaveLength(2);
  await userEvent.click(appointmentOption[1]);

  // Wait for the option to be removed from the DOM
  await waitFor(() => {
    expect(
      screen.queryByRole('option', {
        name: appointmentOption[0].textContent || '',
      })
    ).not.toBeInTheDocument();
  });

  const inputs = screen.getAllByRole('textbox');
  await userEvent.type(inputs[0], 'Test appointment');

  const scheduleSlot = screen.getByTestId('9:03');
  await userEvent.click(scheduleSlot);

  const scheduleMinute = screen.getByTestId('callduraction-list-9:03')
    ?.firstChild?.nextSibling as HTMLElement;
  await userEvent.click(scheduleMinute);

  const saveButton = screen.getByRole('button', { name: 'text.save' });
  await userEvent.click(saveButton);
  expect(mockAddApoinment).toHaveBeenCalled();
  await waitFor(() => {
    expect(mockShowSuccess).toHaveBeenCalled();
  });
});
