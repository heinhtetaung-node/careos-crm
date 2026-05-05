import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { screen, waitFor, within, render } from '__tests__/rtl-test-utils';
import getApiEndpoint from 'utils/endpointHelper';

import SummaryCallModal from '.';

var mockHideModal: jest.Mock;
var mockDecoder: jest.Mock;

jest.mock(
  '../LeadScheduleModal/Schedule',
  () =>
    // eslint-disable-next-line func-names
    function ({ handleSubmit }: any) {
      return (
        <button
          type="button"
          onClick={() =>
            handleSubmit({
              appointmentType: 'type',
              subject: 'subject',
              isPaymentCall: true,
              startTime: { format: jest.fn() },
              lengthOfCall: 3,
            })
          }
        >
          text.save
        </button>
      );
    }
);

jest.mock('presentation/redux/actions/ui', () => {
  mockHideModal = jest.fn().mockReturnValue({ type: 'mock' });
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    hideModal: mockHideModal,
  };
});

jest.mock('shared/helper/ErrorHelper', () => {
  mockDecoder = jest.fn().mockReturnValue(['']);
  return {
    ...jest.requireActual('shared/helper/ErrorHelper'),
    handleGenericStructureError: mockDecoder,
  };
});

describe('<SummaryCallModal />', () => {
  beforeEach(() => {
    mockHideModal.mockClear();
    mockDecoder.mockClear();
  });

  it.skip('should call and show appointment dropdown if showAppointment is true', async () => {
    server.use(
      http.get(
        getApiEndpoint('/api/calendar/v1alpha1/calendars/-/events'),
        () =>
          HttpResponse.json({
            events: [
              {
                name: 'calandars/cal/events/evnt',
                startTime: '2022-02-02T02:02:00.000Z',
                status: undefined,
              },
              {
                name: 'calandars/cal/events/evnt',
                startTime: '2022-02-02T03:02:00.000Z',
                status: 'CALLED',
              },
            ],
          })
      )
    );
    render(<SummaryCallModal enableAppointmentSelection />);
    await waitFor(async () => {
      await user.click(
        screen.getByRole('button', { name: 'text.selectAppointment' })
      );
    });
    await waitFor(() => {
      expect(screen.getByText('02:02')).toBeInTheDocument();
      expect(screen.queryByText('03:02')).not.toBeInTheDocument();
    });
  });

  it('should show toggle rejection reason and appointment modal based on isRejected', async () => {
    render(<SummaryCallModal enableAppointmentSelection={false} />);
    expect(
      screen.getByRole('button', { name: 'text.selectAppointment' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByTestId('appointment-section')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('rejection-reason')).getByRole('button')
    ).toHaveAttribute('aria-disabled', 'true');
    await user.click(
      within(screen.getByTestId('is-rejected')).getByRole('button')
    );
    await user.click(screen.getByRole('option', { name: 'genericOption.yes' }));
    expect(screen.queryByTestId('appointment-section')).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId('rejection-reason')).getByRole('button')
    ).not.toHaveAttribute('aria-disabled', 'true');
  });

  it('should not call submit endpoint if date is not valid', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.post(getApiEndpoint('/v1alpha1/leads/leadId:saveCallSummary'), () =>
        HttpResponse.json(mockHandler())
      )
    );
    render(<SummaryCallModal />, {
      initialState: {
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/leadId',
            },
          },
        },
        authReducer: { data: { user: { name: 'users/12345' } } },
      },
    });
    await user.click(
      within(screen.getByTestId('is-rejected')).getByRole('button')
    );
    await user.click(screen.getByRole('option', { name: 'genericOption.no' }));
    await user.type(
      within(screen.getByTestId('comment')).getByRole('textbox'),
      'defg'
    );
    await user.click(screen.getByRole('button', { name: 'text.save' }));
    await waitFor(() => expect(mockHandler).not.toHaveBeenCalled());
  });

  it.skip('should show error if api fail', async () => {
    const mockHandler = jest.fn();
    server.use(
      http.post(getApiEndpoint('/v1alpha1/leads/leadId:saveCallSummary'), () =>
        HttpResponse.json(mockHandler(), { status: 500 })
      )
    );
    render(<SummaryCallModal />, {
      initialState: {
        leadsDetailReducer: {
          lead: {
            payload: {
              name: 'leads/leadId',
            },
          },
        },
        authReducer: { data: { user: { name: 'users/12345' } } },
      },
    });
    await user.click(
      within(screen.getByTestId('is-rejected')).getByRole('button')
    );
    await user.click(screen.getByRole('option', { name: 'genericOption.yes' }));
    await user.type(
      within(screen.getByTestId('remark')).getByRole('textbox'),
      'abcd'
    );
    await user.type(
      within(screen.getByTestId('comment')).getByRole('textbox'),
      'defg'
    );
    await user.click(screen.getByRole('button', { name: 'text.save' }));
    await waitFor(() => {
      expect(mockHandler).toHaveBeenCalled();
      expect(mockDecoder).toHaveBeenCalled();
    });
  });
});
