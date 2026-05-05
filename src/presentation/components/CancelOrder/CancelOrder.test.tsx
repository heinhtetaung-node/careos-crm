import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { mockUseFlags } from 'shared/helper/flagsmith';
import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';

import CancelOrder from './CancelOrder';
import CreateNewLead from './CreateNewLead';

// Mock FlagsmithProvider
jest.mock('flagsmith/react', () => ({
  useFlags: jest.fn().mockReturnValue({
    'brok-2382_cancellation-management-changes-refund-request_20250515_temp': {
      enabled: true,
    },
    'brok-3044_enable-waive-fees_20250701_temp': {
      enabled: true,
    },
    'brok-3264_update_cancellation_related_fee_and_formula_20251114_temp': {
      enabled: true,
    },
  }),
  FlagsmithProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('data/slices/orderSlice', () => ({
  useSearchOrdersQuery: jest.fn().mockReturnValue({
    data: { orders: [] },
    isLoading: false,
    isSuccess: true,
    refetch: jest.fn(),
  }),
  useGetOrderPolicyItemsQuery: jest.fn().mockReturnValue({
    data: [
      {
        name: 'test-123',
        insurer: 'insurers/42',
        motorItemType: 'MOTOR_TYPE_2',
      },
    ],
    isLoading: false,
    isSuccess: true,
    refetch: jest.fn(),
  }),
  useLazyGetOrderPolicyItemsQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
  useCancelOrderMutation: jest.fn().mockReturnValue([
    jest
      .fn()
      .mockImplementation(() => ({ unwrap: () => ({ leadHumanId: 'L1234' }) })),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
  useCancelOrderPoliciesMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
}));

jest.mock('data/slices/orderCommentSlice', () => ({
  useAddOrderCommentMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isUninitialized: false,
      isSuccess: true,
      data: { message: 'success object' },
    },
  ]),
  useLazyGetOrderCommentsQuery: jest.fn().mockReturnValue([
    jest.fn(),
    {
      isSuccess: true,
      isError: false,
      isLoading: false,
      data: {
        comments: [
          {
            name: 'orders/c33a31af-d074-4a10-9997-82f9f2e1287b/comments/52c31fd4-af85-4bf1-8e46-3641213dfa07',
            createTime: '2022-12-29T04:35:34.529131Z',
            updateTime: '2022-12-29T04:35:34.529131Z',
            deleteTime: null,
            createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
            text: 'test',
            item: '',
          },
        ],
      },
    },
  ]),
}));

describe('Test Cancel order - ', () => {
  it('Renders button and opens dialog when clicked', async () => {
    render(<CancelOrder orderId="1234" />);
    const cancelBtn = screen.getByTestId('cancel-button');
    await userEvent.click(cancelBtn);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
  test('Handles policy selection and comment', async () => {
    server.use(
      http.post(
        getApiEndpoint('/api/order/v1alpha1/orders/:orderId/comments'),
        () => HttpResponse.json({ data: 'success' })
      ),
      http.get(
        getApiEndpoint('/api/orders/:orderId/comments', ServicesName.NODE),
        () => HttpResponse.json({ data: 'success' })
      )
    );
    const mockStore = configureMockStore();
    const store = mockStore({
      ordersReducer: {
        insurersAllReducer: {
          data: [
            {
              name: 'insurers/42',
              displayName: 'FPG Insurance',
              displayNameTh: 'เอฟพีจี ประกันภัย',
            },
            {
              name: 'insurers/40',
              displayName: 'Chubb Samaggi Insurance Co. (PLC)',
              displayNameTh: 'บริษัท ชับบ์สามัคคีประกันภัย จำกัด (มหาชน)',
            },
          ],
        },
      },
    });
    render(
      <Provider store={store as any}>
        <CancelOrder orderId="1234" isCancelled={false} />
      </Provider>
    );
    const cancelBtn = screen.getByTestId('cancel-button');
    await userEvent.click(cancelBtn);
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(0);
    });
    const checkboxes = screen.getAllByRole('checkbox');
    // The first checkbox is the policy selection, the second is waive fee (disabled)
    await userEvent.click(checkboxes[0]);
    await waitFor(() => {
      expect(checkboxes[0]).toBeChecked();
    });
    const [cancelReasonInput, commentBox] = screen.getAllByRole('textbox');

    // Chose cancel reason
    await userEvent.click(cancelReasonInput);
    await userEvent.click(screen.getAllByRole('option')[0]);

    await waitFor(() => {
      expect(cancelReasonInput).toHaveValue(
        'order.cancellationReasons.changeInPremium'
      );
    });
    // Comment content
    await userEvent.clear(commentBox);
    await userEvent.type(commentBox, 'Need to cancel policies');
    await userEvent.type(commentBox, '{esc}');
    await waitFor(() => {
      expect(commentBox).toHaveValue('Need to cancel policies');
    });
    await userEvent.click(screen.getByRole('button', { name: 'text.next' }));
    await waitFor(() => {
      expect(screen.getByTestId('create-new-lead')).toBeInTheDocument();
    });

    const confirmBtn = await screen.findByRole('button', {
      name: 'text.confirmButton',
    });
    expect(confirmBtn).toBeInTheDocument();
    await userEvent.click(confirmBtn);
    await waitFor(() => {
      expect(screen.getByTestId('show-lead-id')).toBeInTheDocument();
      expect(
        screen.getByText('createNewLeadModal.creationMessage')
      ).toBeInTheDocument();
    });
  });

  it('shows waive fee confirmation dialog when waive fee checkbox is checked and confirms', async () => {
    // Mock flags with BROK_3264 disabled to show waive fee checkbox
    mockUseFlags([
      {
        name: 'brok-2382_cancellation_management_changes_refund_request_20250515_temp',
        enabled: true,
      },
      {
        name: 'brok-3044_enable-waive-fees_20250701_temp',
        enabled: true,
      },
      {
        name: 'brok-3264_update_cancellation_related_fee_and_formula_20251114_temp',
        enabled: false,
      },
    ]);
    render(<CancelOrder orderId="1234" />);
    const cancelBtn = screen.getByTestId('cancel-button');
    await userEvent.click(cancelBtn);
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(1);
    });
    const checkboxes = screen.getAllByRole('checkbox');
    // The second checkbox is the waive fee checkbox
    expect(checkboxes[1]).toBeDisabled(); // Should be disabled initially (no policies selected)
    // Select the policy checkbox to enable waive fee checkbox
    await userEvent.click(checkboxes[0]);
    await waitFor(() => {
      expect(checkboxes[1]).not.toBeDisabled();
    });
    // Click the waive fee checkbox
    await userEvent.click(checkboxes[1]);
    // Confirmation dialog should appear
    await waitFor(() => {
      expect(
        screen.getByText(
          'cancellation.waiveCancellationAndProcessingFeeConfirmation'
        )
      ).toBeInTheDocument();
    });
    // Confirm the dialog
    const confirmBtn = screen.getByRole('button', {
      name: 'text.confirmButton',
    });
    await userEvent.click(confirmBtn);
    // Dialog should close
    await waitFor(() => {
      expect(
        screen.queryByText(
          'cancellation.waiveCancellationAndProcessingFeeConfirmation'
        )
      ).not.toBeInTheDocument();
    });
    // Waive fee checkbox should remain checked
    expect(checkboxes[1]).toBeChecked();
  });

  it('shows waive fee confirmation dialog when waive fee checkbox is checked and close dialog', async () => {
    // Mock flags with BROK_3264 disabled to show waive fee checkbox
    mockUseFlags([
      {
        name: 'brok-2382_cancellation_management_changes_refund_request_20250515_temp',
        enabled: true,
      },
      {
        name: 'brok-3044_enable-waive-fees_20250701_temp',
        enabled: true,
      },
      {
        name: 'brok-3264_update_cancellation_related_fee_and_formula_20251114_temp',
        enabled: false,
      },
    ]);
    render(<CancelOrder orderId="1234" />);
    const cancelBtn = screen.getByTestId('cancel-button');
    await userEvent.click(cancelBtn);
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(1);
    });
    const checkboxes = screen.getAllByRole('checkbox');
    // The second checkbox is the waive fee checkbox
    expect(checkboxes[1]).toBeDisabled(); // Should be disabled initially (no policies selected)
    // Select the policy checkbox to enable waive fee checkbox
    await userEvent.click(checkboxes[0]);
    await waitFor(() => {
      expect(checkboxes[1]).not.toBeDisabled();
    });
    // Click the waive fee checkbox
    await userEvent.click(checkboxes[1]);
    // Confirmation dialog should appear
    await waitFor(() => {
      expect(
        screen.getByText(
          'cancellation.waiveCancellationAndProcessingFeeConfirmation'
        )
      ).toBeInTheDocument();
    });

    await userEvent.click(screen.getAllByTestId('close-dialog-button')[1]);
    await waitFor(() => {
      expect(
        screen.queryByText(
          'cancellation.waiveCancellationAndProcessingFeeConfirmation'
        )
      ).not.toBeInTheDocument();
    });
  });

  it('shows waive fee confirmation dialog and cancels', async () => {
    // Mock flags with BROK_3264 disabled to show waive fee checkbox
    mockUseFlags([
      {
        name: 'brok-2382_cancellation_management_changes_refund_request_20250515_temp',
        enabled: true,
      },
      {
        name: 'brok-3044_enable-waive-fees_20250701_temp',
        enabled: true,
      },
      {
        name: 'brok-3264_update_cancellation_related_fee_and_formula_20251114_temp',
        enabled: false,
      },
    ]);
    render(<CancelOrder orderId="1234" />);
    const cancelBtn = screen.getByTestId('cancel-button');
    await userEvent.click(cancelBtn);
    await waitFor(() => {
      expect(screen.getAllByRole('checkbox').length).toBeGreaterThan(1);
    });
    const checkboxes = screen.getAllByRole('checkbox');
    // Select the policy checkbox to enable waive fee checkbox
    await userEvent.click(checkboxes[0]);
    await waitFor(() => {
      expect(checkboxes[1]).not.toBeDisabled();
    });
    // Click the waive fee checkbox
    await userEvent.click(checkboxes[1]);
    // Confirmation dialog should appear
    await waitFor(() => {
      expect(
        screen.getByText(
          'cancellation.waiveCancellationAndProcessingFeeConfirmation'
        )
      ).toBeInTheDocument();
    });
    // Click the cancel button in the dialog
    const cancelBtnDialog = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelBtnDialog);
    // Dialog should close
    await waitFor(() => {
      expect(
        screen.queryByText(
          'cancellation.waiveCancellationAndProcessingFeeConfirmation'
        )
      ).not.toBeInTheDocument();
    });
    // Waive fee checkbox should be unchecked
    expect(checkboxes[1]).not.toBeChecked();
  });
});

describe('Test CreateNewLead', () => {
  const openCreateLead = jest.fn();
  it('Renders with option to create new lead from order', () => {
    const { rerender } = render(
      <CreateNewLead
        orderId="1234"
        selectedPolicies={[
          {
            name: 'test-123',
            id: 'insurers/42',
            isCancelled: false,
            policyDate: '01/02/2024',
          },
        ]}
        policies={[]}
        handleModalToggle={openCreateLead}
        handleCancelOrder={jest.fn()}
        cancellingPolicy={false}
        showLeadId={false}
        setShowLeadId={jest.fn()}
      />
    );
    rerender(
      <CreateNewLead
        orderId="1234"
        open
        selectedPolicies={[
          {
            name: 'test-123',
            id: 'insurers/42',
            isCancelled: true,
            policyDate: '01/02/2024',
          },
        ]}
        policies={[]}
        handleModalToggle={openCreateLead}
        handleCancelOrder={jest.fn()}
        cancellingPolicy={false}
        showLeadId={false}
        setShowLeadId={jest.fn()}
      />
    );
    expect(screen.getByTestId('create-new-lead-form')).toBeInTheDocument();
  });
  it('Handles cancellation and creates new lead from order', async () => {
    render(
      <CreateNewLead
        orderId="1234"
        selectedPolicies={[
          {
            name: 'test-123',
            id: 'insurers/42',
            isCancelled: false,
            policyDate: '01/02/2024',
          },
        ]}
        policies={[]}
        handleModalToggle={openCreateLead}
        open
        handleCancelOrder={openCreateLead}
        cancellingPolicy={false}
        showLeadId={false}
        setShowLeadId={jest.fn()}
      />
    );
    const confirmBtn = screen.getByRole('button', {
      name: 'text.confirmButton',
    });
    await userEvent.click(confirmBtn);
    await waitFor(() => {
      expect(openCreateLead).toHaveBeenCalled();
    });
  });
});
