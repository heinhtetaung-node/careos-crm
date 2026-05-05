import userEvent from '@testing-library/user-event';
import { sub, add, format } from 'date-fns';
import React from 'react';

import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';

import TimeSlots, { showCancelButton } from '.';

describe('showCancelButton', () => {
  const pastAppointmentInfo = {
    startTime: format(
      sub(new Date(), { minutes: 40 }),
      'yyyy-MM-dd HH:mm'
    ).toString(),
    endTime: format(
      sub(new Date(), { minutes: 5 }),
      'yyyy-MM-dd HH:mm'
    ).toString(),
    length: '15',
  };

  const futureAppointmentInfo = {
    startTime: format(
      add(new Date(), { hours: 8, minutes: 45 }),
      'yyyy-MM-dd HH:mm'
    ).toString(),
    endTime: format(
      add(new Date(), { hours: 9 }),
      'yyyy-MM-dd HH:mm'
    ).toString(),
    length: '15',
  };

  const appointmentDetail = {
    status: 'CALLED',
    appointmentType: 'fakeAppointmentType',
    subject: 'fakeSubject',
    name: 'fakeName',
    detailLink: 'fakeDetailLink',
    humanId: {
      label: 'fakeHumanIdLabel',
      id: 'fakeHumanId',
    },
  };

  it('returns false when appointment is in future, status is "CALLED"', () => {
    const showButton = showCancelButton(
      futureAppointmentInfo,
      appointmentDetail
    );
    expect(showButton).toBeFalsy();
  });

  it('returns true when appointment is in future, status is not "CALLED"', () => {
    const showButton = showCancelButton(futureAppointmentInfo, {
      ...appointmentDetail,
      status: 'None',
    });
    expect(showButton).toBeTruthy();
  });

  it('returns true when appointment is in past, status is not "CALLED"', () => {
    const showButton = showCancelButton(pastAppointmentInfo, appointmentDetail);
    expect(showButton).toBeFalsy();
  });
});

describe('TimeSlots Component', () => {
  const mockFn = jest.fn();
  const timeSlotData: any = {
    date: '2022-07-19',
    end: '20:00',
    events: [
      {
        appointment: {
          lead: 'leads/5fd49a17-5669-452f-a663-14538b1ba53b',
          appointmentType: 'agreed',
          payment: false,
          subject: 'ok',
        },
        createBy: 'users/368d0057-204d-4855-bde8-6f9a64edc3ba',
        createTime: '2022-07-19T03:04:50.159311Z',
        deleteTime: null,
        endTime: '2022-07-19T18:45:00Z',
        name: 'calendars/368d0057-204d-4855-bde8-6f9a64edc3ba/events/dc9a75eb-fe45-4286-94fe-9559d1727972',
        startTime: '2022-07-19T18:30:00Z',
        updateTime: '2022-07-19T03:04:50.159311Z',
      },
      {
        appointment: {
          lead: 'leads/5fd49a17-5669-452f-a663-14538b1ba53b',
          appointmentType: 'agreed',
          payment: true,
          subject: 'ok',
        },
        createBy: 'users/368d0057-204d-4855-bde8-6f9a64edc3ba',
        createTime: '2022-07-19T03:04:24.850069Z',
        deleteTime: null,
        endTime: '2022-07-19T19:45:00Z',
        name: 'calendars/368d0057-204d-4855-bde8-6f9a64edc3ba/events/6481f4a2-d5d5-4b13-adb9-a03520ec9769',
        startTime: '2022-07-19T19:30:00Z',
        updateTime: '2022-07-19T03:04:24.850069Z',
      },
    ],
    schedule: [
      {
        appointment: {
          lead: 'leads/5fd49a17-5669-452f-a663-14538b1ba53b',
          appointmentType: 'agreed',
          payment: false,
          subject: 'ok',
          status: 'PENDING',
        },
        createBy: 'users/368d0057-204d-4855-bde8-6f9a64edc3ba',
        createTime: '2022-07-19T03:04:50.159311Z',
        deleteTime: null,
        endTime: '2022-07-19T18:45:00Z',
        isPayment: false,
        length: '15',
        name: 'calendars/368d0057-204d-4855-bde8-6f9a64edc3ba/events/dc9a75eb-fe45-4286-94fe-9559d1727972',
        startTime: '2022-07-19T18:30:00Z',
        time: '2022-07-19T18:30:00Z',
        updateTime: '2022-07-19T03:04:50.159311Z',
      },
      {
        appointment: {
          lead: 'leads/5fd49a17-5669-452f-a663-14538b1ba53b',
          appointmentType: 'agreed',
          payment: true,
          subject: 'ok',
          status: 'CALLED',
        },
        createBy: 'users/368d0057-204d-4855-bde8-6f9a64edc3ba',
        createTime: '2022-07-19T03:04:24.850069Z',
        deleteTime: null,
        endTime: '2022-07-19T19:45:00Z',
        isPayment: true,
        length: '15',
        name: 'calendars/368d0057-204d-4855-bde8-6f9a64edc3ba/events/6481f4a2-d5d5-4b13-adb9-a03520ec9769',
        startTime: '2022-07-19T19:30:00Z',
        time: '2022-07-19T19:30:00Z',
        updateTime: '2022-07-19T03:04:24.850069Z',
      },
    ],
    slots: [3, 6, 9, 12, 15],
    start: '09:00',
  };

  it('will be mounted correctly', () => {
    render(
      <TimeSlots
        data={timeSlotData}
        onUpdate={mockFn}
        onGetAppointmentDetail={mockFn}
        handleDeleteAppointment={mockFn}
      />
    );
    expect(screen.getByTestId('time-slots-container')).toBeInTheDocument();
  });

  it.skip('should show cancel appoint if it is not view only and appointment is not call', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-07-18T18:45:00Z'));
    const getAppointmentDetailFn = jest.fn((arg1, arg2) =>
      arg2({
        name: 'name',
        detailLink: 'detailLink',
        humanId: { id: 'id', label: 'label' },
      })
    );
    render(
      <TimeSlots
        data={timeSlotData}
        onUpdate={mockFn}
        onGetAppointmentDetail={getAppointmentDetailFn}
        handleDeleteAppointment={mockFn}
      />
    );
    await userEvent.click(screen.getByTestId('18:30'));
    const modal = screen.getByTestId('appointment-detail-popup');
    await waitFor(() => {
      expect(
        within(modal).queryByTestId('timeslot-cancel-button')
      ).toBeInTheDocument();
    });
  });

  it.skip('will not show cancel appointment if is is view only', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-07-18T18:45:00Z'));
    const getAppointmentDetailFn = jest.fn((arg1, arg2) =>
      arg2({
        name: 'name',
        detailLink: 'detailLink',
        humanId: { id: 'id', label: 'label' },
      })
    );
    render(
      <TimeSlots
        data={timeSlotData}
        onUpdate={mockFn}
        onGetAppointmentDetail={getAppointmentDetailFn}
        handleDeleteAppointment={mockFn}
        viewOnly
      />
    );
    await userEvent.click(screen.getByTestId('18:30'));
    const modal = screen.getByTestId('appointment-detail-popup');
    expect(
      within(modal).queryByTestId('timeslot-cancel-button')
    ).not.toBeInTheDocument();
  });

  it.skip('will not show cancel appointment if is called or passed the current time', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2022-07-20T18:45:00Z'));
    const getAppointmentDetailFn = jest.fn((arg1, arg2) =>
      arg2({
        name: 'name',
        detailLink: 'detailLink',
        humanId: { id: 'id', label: 'label' },
      })
    );
    render(
      <TimeSlots
        data={timeSlotData}
        onUpdate={mockFn}
        onGetAppointmentDetail={getAppointmentDetailFn}
        handleDeleteAppointment={mockFn}
      />
    );
    await userEvent.click(screen.getByTestId('18:30'));
    const modal = screen.getByTestId('appointment-detail-popup');
    expect(
      within(modal).queryByTestId('timeslot-cancel-button')
    ).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId('19:30'));
    expect(
      within(modal).queryByTestId('timeslot-cancel-button')
    ).not.toBeInTheDocument();
  });
});
