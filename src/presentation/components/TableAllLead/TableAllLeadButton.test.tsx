import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import * as redux from 'react-redux';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import TableAllLeadButton from './TableAllLeadButton';

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));
const mockedDispatch = jest
  .fn()
  .mockImplementation((arg: any) => arg.payload.callback());
(redux.useDispatch as any).mockReturnValue(mockedDispatch);

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest.fn(() => ({
    data: 'user',
  })),
}));

jest.mock(
  './assignModal',
  () =>
    function AssignModal({ handleConfirm }: any) {
      handleConfirm();
      return <>AssignModal</>;
    }
);

jest.mock(
  '../controls/Autocomplete/Autocomplete',
  () =>
    function Autocomplete({ onChange }: any) {
      const handleClick = () =>
        onChange({
          target: { value: { key: 'AgentName' } },
        });
      return (
        <button type="submit" onClick={handleClick}>
          Autocomplete
        </button>
      );
    }
);

const buttonState = [
  {
    ids: ['lead/lead_id'],
  },
  {
    ids: ['lead/lead_id/assignment/assignment_id'],
    unassign: true,
  },
];

describe('<TableAllLeadButton /> Assignment Page', () => {
  beforeEach(() => mockedDispatch.mockClear());

  test('Unassign', async () => {
    render(
      <TableAllLeadButton
        isAssign
        buttonState={buttonState}
        callApiAgain={jest.fn()}
      >
        <div>children</div>
      </TableAllLeadButton>
    );
    await user.click(screen.getByRole('button', { name: 'text.unassign' }));
    expect(mockedDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          ids: ['lead/lead_id/assignment/assignment_id'],
        }),
      })
    );
  });

  // FIXME: Takes forever to run
  test.skip('Assign', async () => {
    jest.useFakeTimers();
    const mockCallApiAgain = jest.fn();
    render(
      <TableAllLeadButton
        isAssign
        buttonState={buttonState}
        callApiAgain={mockCallApiAgain}
      >
        <div>children</div>
      </TableAllLeadButton>
    );
    await user.click(screen.getByText('Autocomplete'));
    await user.click(screen.getByRole('button', { name: 'text.assign' }));
    expect(mockedDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          ids: ['lead/lead_id'],
          assignedTo: 'AgentName',
        }),
      })
    );
    expect(mockCallApiAgain).not.toHaveBeenCalled();
    jest.advanceTimersByTime(3000);
    expect(mockCallApiAgain).toHaveBeenCalled();
  });
});

// FIXME: Takes forever to run
describe.skip('<TableAllLeadButton /> Rejection Page', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date());
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const newButtonState = [
    { assign: false, ids: [] },
    { unassign: false, ids: [] },
    {
      approve: null,
      rejections: [
        'lead/lead_id/rejections/rejection_id',
        'lead/lead_id1/rejections/rejection_id1',
        'lead/lead_id2/rejections/rejection_id2',
        'lead/lead_id3/rejections/rejection_id3',
        'lead/lead_id4/rejections/rejection_id4',
        'lead/lead_id5/rejections/rejection_id5',
      ],
    },
  ];

  test('Approve', async () => {
    const callApiAgainFn = jest.fn();
    server.use(
      http.post(
        `${process.env.VITE_GATEWAY_ENDPOINT}/api/leads/bulk/rejection`,
        () =>
          HttpResponse.json({
            message: 'Bulk update successfully !',
            statusCode: 200,
          })
      )
    );
    render(
      <TableAllLeadButton
        isReject
        buttonState={newButtonState}
        callApiAgain={callApiAgainFn}
      >
        <div>children</div>
      </TableAllLeadButton>
    );
    await user.click(screen.getByTestId('reject-buttons-approve-btn'));

    await waitFor(async () => {
      expect(
        screen.getByTestId('rejection-modal-confirm-btn')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Do you want approve 6 leads ?')
      ).toBeInTheDocument();
      await user.click(screen.getByTestId('rejection-modal-confirm-btn'));
    });
  });

  test('Decline', async () => {
    const callApiAgainFn = jest.fn();
    server.use(
      http.post(
        `${process.env.VITE_GATEWAY_ENDPOINT}/api/leads/bulk/rejection`,
        () =>
          HttpResponse.json({
            message: 'Bulk update successfully !',
            statusCode: 200,
          })
      )
    );
    render(
      <TableAllLeadButton
        isReject
        buttonState={newButtonState}
        callApiAgain={callApiAgainFn}
      >
        <div>children</div>
      </TableAllLeadButton>
    );
    await user.click(screen.getByTestId('reject-buttons-decline-btn'));

    await waitFor(async () => {
      expect(
        screen.getByTestId('rejection-modal-confirm-btn')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Do you want decline 6 leads ?')
      ).toBeInTheDocument();
      await user.click(screen.getByTestId('rejection-modal-confirm-btn'));
    });
  });
});
