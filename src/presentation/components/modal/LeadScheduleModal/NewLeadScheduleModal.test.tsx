import userEvent from '@testing-library/user-event';
import { nextMonday } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '__tests__/rtl-test-utils';
import { baseUrls } from 'data/slices/apiSlice';
import * as Apis from 'data/slices/leadDetailSlices/appointmentSlice';
import { buildUrl } from 'utils/url';

import NewLeadScheduleModal from './NewLeadScheduleModal';

var mockShowSnackBar: jest.Mock;
var mockShowSnackBar: jest.Mock;

const _setTimeout = global.setTimeout;

function continuouslyAdvanceTimers() {
  let isCancelled = false;

  async function advance() {
    while (!isCancelled) {
      jest.runOnlyPendingTimers();
      // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
      await new Promise((r) => _setTimeout(r, 1));
    }
  }

  advance();
  return () => {
    isCancelled = true;
  };
}

const timeSlotDataMocker = jest.fn().mockReturnValue({
  startTime: '11:00',
  length: 3,
});

const mockApiResponse = {
  data: {
    days: [
      {
        date: '2022-11-21',
        end: '2022-11-21T20:00:00.000Z',
        events: [],
        slots: [3, 6, 9, 12, 15],
        start: '2022-11-21T09:00:00.000Z',
      },
      {
        date: '2022-11-22',
        end: '2022-11-22T20:00:00.000Z',
        events: [
          {
            appointment: {
              appointmentType: 'requested',
              lead: 'leads/74f6f477-d505-4475-b6e2-5e63927112dd',
              payment: true,
              subject: 'Rabbit Care - Car Insurance Quote L9852943',
            },
            createBy: 'users/00e9d71a-3c7b-4473-8c51-bd5f499a35fb',
            createTime: '2022-11-21T07:03:21.514816Z',
            deleteTime: null,
            endTime: '2022-11-22T16:36:00Z',
            name: 'calendars/00e9d71a-3c7b-4473-8c51-bd5f499a35fb/events/447c115f-024e-4c53-a3fc-df4ce5c8f1a5',
            startTime: '2022-11-22T16:30:00Z',
            status: '',
            updateTime: '2022-11-21T07:03:21.514816Z',
          },
        ],
        slots: [3, 6, 9, 12, 15],
        start: '2022-11-22T09:00:00.000Z',
      },
      {
        date: '2022-11-23',
        end: '2022-11-23T20:00:00.000Z',
        events: [],
        slots: [3, 6, 9, 12, 15],
        start: '2022-11-23T09:00:00.000Z',
      },
    ],
    length: 3,
    start: '2022-11-21',
  },
};

const mockStoreData = (sundayContactable = false) => ({
  leadsDetailReducer: {
    lead: {
      payload: { name: 'leads/leadId', data: { sundayContactable } },
    },
  },
  authReducer: { data: { user: { name: 'users/userId' } } },
});

function MockedTimeSlots({ onUpdate }: any) {
  const handleClick = () => {
    onUpdate(timeSlotDataMocker());
  };
  return (
    <button type="button" onClick={handleClick}>
      Mock Btn
    </button>
  );
}

jest.mock('presentation/components/Timeslots', () => ({
  __esModule: true,
  default: MockedTimeSlots,
}));

jest.mock('presentation/redux/actions/ui', () => {
  mockShowSnackBar = jest.fn().mockReturnValue({ type: '' });
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockShowSnackBar,
  };
});

// the below tests are skipped because of msw issue with useFakeTimer
describe.skip('NewLeadScheduleModal', () => {
  beforeEach(() => {
    mockShowSnackBar.mockClear();
    jest.useFakeTimers().setSystemTime(new Date('2022-11-22T02:00:00.000Z')); // 10:00 in local time
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should show days returned from api', async () => {
    server.use(
      http.get(buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }), () =>
        HttpResponse.json(mockApiResponse)
      )
    );

    render(<NewLeadScheduleModal isOpen onClose={jest.fn()} />, {
      initialState: mockStoreData(true),
    });

    mockApiResponse.data.days.forEach(async (day) => {
      jest.advanceTimersByTime(5000);
      await waitFor(() => {
        expect(screen.findByTestId(`daycard-${day.date}`)).toBeInTheDocument();
      });
    });
  });

  it('should call the api with next week date/previous date if right/right arrow is clicked', async () => {
    jest.useRealTimers();
    const mockHandler = jest.fn().mockReturnValue(mockApiResponse);
    server.use(
      http.get(
        buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }),
        ({ params }) =>
          HttpResponse.json(
            mockHandler(
              format(
                utcToZonedTime(
                  new Date(
                    typeof params.startDate === 'string' ? params.startDate : ''
                  ),
                  'UTC'
                ),
                'yyyy-MM-dd'
              )
            )
          )
      )
    );

    render(<NewLeadScheduleModal isOpen onClose={jest.fn()} />);
    await waitForElementToBeRemoved(screen.getAllByTestId('card-loading'));
    await screen.findByTestId('daycard-2022-11-21');
    await userEvent.click(screen.getByTestId('right-arrow'));
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith(
        format(utcToZonedTime(nextMonday(new Date()), 'UTC'), 'yyyy-MM-dd')
      )
    );
    expect(screen.getByTestId('left-arrow')).not.toBeDisabled();
    await userEvent.click(screen.getByTestId('left-arrow'));
    await waitFor(() =>
      expect(mockHandler).toHaveBeenCalledWith(
        format(utcToZonedTime(new Date(), 'UTC'), 'yyyy-MM-dd')
      )
    );
  });

  it('should always enable the left arrow', async () => {
    server.use(
      http.get(buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }), () =>
        HttpResponse.json(mockApiResponse)
      )
    );
    render(<NewLeadScheduleModal isOpen onClose={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId('left-arrow')).toBeEnabled());
  });

  it('should close the modal if cancel is clicked', async () => {
    server.use(
      http.get(buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }), () =>
        HttpResponse.json(mockApiResponse)
      )
    );
    const closeFn = jest.fn();
    render(<NewLeadScheduleModal isOpen onClose={closeFn} />);
    await userEvent.click(screen.getByRole('button', { name: 'cancel' }));
    expect(closeFn).toHaveBeenCalled();
  });

  it('should display clicked timeslot if day card is clicked', async () => {
    server.use(
      http.get(buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }), () =>
        HttpResponse.json(mockApiResponse)
      )
    );
    const cancelAdvance = continuouslyAdvanceTimers();
    render(<NewLeadScheduleModal isOpen onClose={jest.fn()} />);
    await userEvent.click(await screen.findByTestId('daycard-2022-11-22'));
    expect(screen.getAllByRole('textbox')[1]).toHaveValue('22/11/2022');
    cancelAdvance();
  });

  it('should call with extra day if contactable on sunday is true', async () => {
    const mockHandler = jest.fn().mockReturnValue(mockApiResponse);
    server.use(
      http.get(
        buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }),
        async ({ params }) => HttpResponse.json(mockHandler(params.days))
      )
    );
    const cancelAdvance = continuouslyAdvanceTimers();
    jest.runAllTimers();
    render(<NewLeadScheduleModal isOpen onClose={jest.fn()} />, {
      initialState: mockStoreData(true),
    });
    await waitFor(() => expect(mockHandler).toHaveBeenCalledWith('7'));
    cancelAdvance();
  });

  it('should create appointment if save is clicked', async () => {
    const mockCreateEventHandler = jest.fn().mockResolvedValue({});
    jest
      .spyOn(Apis, 'useAddAppointmentMutation')
      .mockReturnValue([mockCreateEventHandler] as never);
    server.use(
      http.get(buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }), () =>
        HttpResponse.json(mockApiResponse)
      )
    );
    const cancelAdvance = continuouslyAdvanceTimers();
    render(<NewLeadScheduleModal isOpen onClose={jest.fn()} />, {
      initialState: mockStoreData(),
    });
    await waitForElementToBeRemoved(screen.getByRole('progressbar'));
    await userEvent.click(
      within(screen.getByTestId('muiSelect-appointmentType')).getByRole(
        'button'
      )
    );
    await userEvent.click(
      within(screen.getByRole('presentation')).getByRole('option', {
        name: 'text.customerRequested',
      })
    );
    await userEvent.type(screen.getByTestId('input-subject'), 'abcd');
    await userEvent.click(
      within(screen.getByTestId('muiSelect-paymentType')).getByRole('button')
    );
    await userEvent.click(
      within(screen.getByRole('presentation')).getByRole('option', {
        name: 'text.yes',
      })
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Mock Btn' })
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'save' })).not.toBeDisabled()
    );
    await userEvent.click(screen.getByRole('button', { name: 'save' }));
    await waitFor(() => expect(mockCreateEventHandler).toHaveBeenCalled());
    cancelAdvance();
  });

  it('should display snack bar if  appointment time is in the past', async () => {
    timeSlotDataMocker.mockReturnValue({
      startTime: '09:00',
      length: 3,
    });
    server.use(
      http.get(buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }), () =>
        HttpResponse.json(mockApiResponse)
      )
    );
    const cancelAdvance = continuouslyAdvanceTimers();
    render(<NewLeadScheduleModal isOpen onClose={jest.fn()} />, {
      initialState: mockStoreData(),
    });
    await userEvent.click(
      within(screen.getByTestId('muiSelect-appointmentType')).getByRole(
        'button'
      )
    );
    await userEvent.click(
      within(screen.getByRole('presentation')).getByRole('option', {
        name: 'text.customerRequested',
      })
    );
    await userEvent.type(screen.getByTestId('input-subject'), 'abcd');
    await userEvent.click(
      within(screen.getByTestId('muiSelect-paymentType')).getByRole('button')
    );
    await userEvent.click(
      within(screen.getByRole('presentation')).getByRole('option', {
        name: 'text.yes',
      })
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Mock Btn' })
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'save' })).not.toBeDisabled()
    );
    await userEvent.click(screen.getByRole('button', { name: 'save' }));
    await waitFor(() =>
      expect(mockShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.passedBookingTime',
        status: 'error',
      })
    );
    cancelAdvance();
  });

  it('should display past date', async () => {
    server.use(
      http.get(buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }), () =>
        HttpResponse.json(mockApiResponse)
      )
    );
    render(<NewLeadScheduleModal isOpen onClose={jest.fn()} />, {
      initialState: mockStoreData(),
    });
    const dateInput = within(screen.getByTestId('appointmentDate')).getByRole(
      'textbox'
    );
    await userEvent.type(
      dateInput,
      '{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}22112021'
    );
    expect(dateInput).toHaveValue('22/11/2021');
  });

  it('call getAppointment Api if the selected date from datepicker is valid', async () => {
    const mockApiHandler = jest.fn().mockReturnValue(mockApiResponse);
    server.use(
      http.get(
        buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }),
        ({ params }) => HttpResponse.json(mockApiHandler(params.startDate))
      )
    );
    render(<NewLeadScheduleModal isOpen onClose={jest.fn()} />, {
      initialState: mockStoreData(),
    });
    const dateInput = within(screen.getByTestId('appointmentDate')).getByRole(
      'textbox'
    );
    await userEvent.type(
      dateInput,
      `{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}{backspace}23112022`
    );
    await waitFor(() =>
      expect(mockApiHandler).toHaveBeenCalledWith('2022-11-23T00:00:00.000Z')
    );
  });

  it('should not display inputs and btns if it is only view only', () => {
    render(<NewLeadScheduleModal isOpen onClose={jest.fn()} isViewOnly />, {
      initialState: mockStoreData(),
    });
    expect(
      screen.queryByText('timeSlotCallBack.appointmentType')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('text.subject')).not.toBeInTheDocument();
    expect(screen.queryByText('text.paymentCall')).not.toBeInTheDocument();
    expect(screen.queryByText('text.date')).toBeInTheDocument();
    expect(screen.queryByText('cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('add')).not.toBeInTheDocument();
  });

  it('should fetch 7 days if it is view only', async () => {
    const mockApiHandler = jest.fn();
    server.use(
      http.get(
        buildUrl(baseUrls.goBff, { path: '/v1alpha1/schedule' }),
        ({ params }) =>
          HttpResponse.json(
            mockApiHandler({
              days: params.days,
              lead: params.lead,
            })
          )
      )
    );
    render(<NewLeadScheduleModal isOpen onClose={jest.fn()} isViewOnly />, {
      initialState: mockStoreData(false),
    });
    await waitFor(() =>
      expect(mockApiHandler).toHaveBeenCalledWith({ days: '7', lead: null })
    );
  });
});
