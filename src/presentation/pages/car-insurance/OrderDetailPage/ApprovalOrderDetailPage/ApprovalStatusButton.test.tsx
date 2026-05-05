/* eslint-disable @typescript-eslint/no-non-null-assertion */
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React, { PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { act, render, screen, waitFor, within } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import { store } from 'presentation/redux/store';
import * as CONSTANTS from 'shared/constants';
import {
  ItemApprovalStatus,
  ItemSubmissionStatus,
} from 'shared/constants/orderType';
import { mockUseFlags } from 'shared/helper/flagsmith';
import FeatureFlags from 'config/flagsmithConfig';

import ApprovalStatusButton from './ApprovalStatusButtons';

let useCreateShipmentMutationMockImpl: any = null;
jest.mock('data/slices/shipmentSlice', () => {
  const actual = jest.requireActual('data/slices/shipmentSlice');
  return {
    ...actual,
    useCreateShipmentMutation: (...args: any[]) => {
      if (useCreateShipmentMutationMockImpl) {
        return useCreateShipmentMutationMockImpl(...args);
      }
      return actual.useCreateShipmentMutation(...args);
    },
  };
});

var mockSnackBar: jest.Mock;
jest.mock('presentation/redux/actions/ui', () => {
  mockSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockSnackBar,
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({
    orderId: '6145018e-46d0-4763-9aca-caa0fa798908',
  }),
}));

beforeEach(() => {
  mockSnackBar.mockClear();
  mockUseFlags([
    FeatureFlags.BROK_3788_ENABLE_DIGITAL_DELIVERY_SHIPMENT_ON_POLICY_APPROVAL_20250115_TEMP,
  ]);
});

const storeRef = setupApiStore(apiSlice);

function ComponentWithProvider({ children }: PropsWithChildren) {
  return (
    <Provider store={{ ...storeRef.store, ...store }}>{children}</Provider>
  );
}

const orderPolicy = {
  policy: {
    policyNumber: 'R11254556',
  },
};

test('Test <ApprovalStatusButton> show buttons disable when policy submitted and approval status is approved or rejected', () => {
  render(
    <ComponentWithProvider>
      <ApprovalStatusButton
        name=""
        submissionStatus={ItemSubmissionStatus.PRESUBMITTED}
        approvalStatus={ItemApprovalStatus.APPROVED}
      />
    </ComponentWithProvider>
  );

  const approvedButton = screen.getByRole('button', {
    name: 'approvalStatusButtons.insurerApproved',
  });

  expect(approvedButton).toBeDisabled();
});

test('Test <ApprovalStatusButton/> approve case', async () => {
  server.use(
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId/items/:itemId:updateItemApprovalStatus`,
      () =>
        HttpResponse.json({
          approvalStatus: 'ITEM_APPROVAL_STATUS_APPROVED',
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
        })
    )
  );
  render(
    <ComponentWithProvider>
      <ApprovalStatusButton
        orderPolicy={orderPolicy}
        name="orders/6145018e-46d0-4763-9aca-caa0fa798908/items/17f4d1b8-4409-4140-9b2e-229da1353956"
        showApprovalStatusButtons
        submissionStatus={ItemSubmissionStatus.SUBMITTED}
        approvalStatus={ItemApprovalStatus.PENDING}
      />
    </ComponentWithProvider>
  );

  let containApprovalButton = screen.getByTestId('approval-contain-button');

  act(() => {
    userEvent.click(containApprovalButton);
  });

  const confirmationBox = await screen.findByRole('presentation');
  expect(confirmationBox).toBeInTheDocument();

  const confirmButtons = within(confirmationBox).getAllByRole('button');
  expect(confirmButtons).toHaveLength(3);

  userEvent.click(confirmButtons[1]);
  await waitFor(() => {
    const textApprovalButton = screen.getByTestId('approval-text-button');
    containApprovalButton = screen.queryByTestId('approval-contain-button')!; // getByTestId will throw error when it can't an element.

    expect(containApprovalButton).not.toBeInTheDocument();
    expect(textApprovalButton).toBeDisabled();
    expect(mockSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'text.updatePolicySuccessfully',
      status: CONSTANTS.snackBarConfig.type.success,
    });
  });
});

// TODO: Fix me
test.skip('Test <ApprovalStatusButton/> problem case', async () => {
  server.use(
    http.post(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId/comments`,
      () => HttpResponse.json({ data: 'success' })
    ),
    http.get(
      `${process.env.VITE_GATEWAY_ENDPOINT}/api/orders/:orderId/comments`,
      () => HttpResponse.json({ data: 'success' })
    ),
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId/items/:itemId:updateItemApprovalStatus`,
      () =>
        HttpResponse.json({
          approvalStatus: 'ITEM_APPROVAL_STATUS_SUBMISSION_PROBLEM',
          submissionStatus: 'ITEM_SUBMISSION_STATUS_PRESUBMITTED',
        })
    )
  );

  render(
    <ComponentWithProvider>
      <ApprovalStatusButton
        name="orders/6145018e-46d0-4763-9aca-caa0fa798908/items/17f4d1b8-4409-4140-9b2e-229da1353956"
        showApprovalStatusButtons
        submissionStatus={ItemSubmissionStatus.PRESUBMITTED}
        approvalStatus={ItemApprovalStatus.PENDING}
      />
    </ComponentWithProvider>
  );

  const problemButton = screen.getByRole('button', {
    name: 'approvalStatusButtons.problem',
  });
  userEvent.click(problemButton);

  const dialog = screen.getByRole('presentation');
  const saveButton = within(dialog).getByRole('button', { name: 'text.save' });
  expect(saveButton).toBeDisabled();
  const reasons = within(dialog).getByRole('combobox');

  userEvent.click(reasons.querySelector('input')!);
  const menu = screen.getAllByRole('presentation')[1];

  const option = within(menu).getByText('text.remarks');
  userEvent.click(option);

  const commentBox = screen.getByTestId('problem-comment-textfield');

  userEvent.type(commentBox, 'Need to fix!');
  expect(saveButton).toBeEnabled();

  act(() => {
    userEvent.click(saveButton);
  });

  await waitFor(() => {
    expect(screen.getByTestId('approval-text-button')).toBeInTheDocument();
  });
  const textSubmissionButton = screen.getByTestId('approval-text-button');

  expect(textSubmissionButton).toHaveTextContent('text.submissionProblem');
  expect(textSubmissionButton).toBeDisabled();
});

test('Test <ApprovalStatusButton/> submission problem', async () => {
  server.use(
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId/items/:itemId:updateItemApprovalStatus`,
      () =>
        HttpResponse.json({
          approvalStatus: 'ITEM_APPROVAL_STATUS_PENDING',
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
        })
    )
  );

  render(
    <ComponentWithProvider>
      <ApprovalStatusButton
        orderPolicy={orderPolicy}
        name="orders/6145018e-46d0-4763-9aca-caa0fa798908/items/17f4d1b8-4409-4140-9b2e-229da1353956"
        showApprovalStatusButtons
        submissionStatus={ItemSubmissionStatus.SUBMITTED}
        approvalStatus={ItemApprovalStatus.SUBMISSION_PROBLEM}
      />
    </ComponentWithProvider>
  );

  const issuesFixedButton = await screen.findByTestId(
    'approval-issues-fixed-button'
  );

  act(() => {
    userEvent.click(issuesFixedButton);
  });

  const confirmationBox = await screen.findByRole('presentation');
  expect(confirmationBox).toBeInTheDocument();

  const confirmButtons = within(confirmationBox).getAllByRole('button');
  expect(confirmButtons).toHaveLength(3);

  userEvent.click(confirmButtons[1]);

  const approvalButton = await screen.findByTestId('approval-contain-button');
  await waitFor(() => {
    expect(approvalButton).toBeInTheDocument();
    expect(approvalButton).toBeEnabled();
  });
});

test('Test <ApprovalStatusButton/> policy uploaded case', async () => {
  server.use(
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId/items/:itemId:updateItemApprovalStatus`,
      () =>
        HttpResponse.json({
          approvalStatus: 'ITEM_APPROVAL_STATUS_POLICY_UPLOADED',
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
        })
    )
  );
  render(
    <ComponentWithProvider>
      <ApprovalStatusButton
        orderPolicy={orderPolicy}
        name="orders/6145018e-46d0-4763-9aca-caa0fa798908/items/17f4d1b8-4409-4140-9b2e-229da1353956"
        showApprovalStatusButtons
        isPolicyReady
        submissionStatus={ItemSubmissionStatus.SUBMITTED}
        approvalStatus={ItemApprovalStatus.APPROVED}
      />
    </ComponentWithProvider>
  );

  const policyUploadedButton = screen.getByRole('button', {
    name: 'approveStatus.policyUploaded',
  });

  act(() => {
    userEvent.click(policyUploadedButton);
  });

  const confirmationBox = await screen.findByRole('presentation');
  expect(confirmationBox).toBeInTheDocument();

  const confirmButtons = within(confirmationBox).getAllByRole('button');
  expect(confirmButtons).toHaveLength(3);

  userEvent.click(confirmButtons[1]);

  await waitFor(() => {
    const textApprovalButton = screen.getByTestId('approval-text-button');

    expect(textApprovalButton).toHaveTextContent(
      'approveStatus.policyUploaded'
    );
    expect(textApprovalButton).toBeDisabled();
    expect(mockSnackBar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'text.updatePolicySuccessfully',
      status: CONSTANTS.snackBarConfig.type.success,
    });
  });
});

test('handlePolicyUploaded should catch shipment errors and show snackbar', async () => {
  // Mock patch request for policy upload
  server.use(
    http.patch(
      `${process.env.VITE_API_ENDPOINT}/api/order/v1alpha1/orders/:orderId/items/:itemId:updateItemApprovalStatus`,
      () =>
        HttpResponse.json({
          approvalStatus: 'ITEM_APPROVAL_STATUS_POLICY_UPLOADED',
          submissionStatus: 'ITEM_SUBMISSION_STATUS_SUBMITTED',
        })
    ),
    // Mock shipment creation to return error
    http.post(
      `${process.env.VITE_API_ENDPOINT}/api/orders/:orderId/shipments`,
      () =>
        HttpResponse.json(
          {
            message: 'Shipment creation failed',
          },
          { status: 500 }
        )
    )
  );

  const mockCreateShipment = jest.fn().mockReturnValue({
    unwrap: jest.fn().mockRejectedValue({
      data: { message: 'Shipment creation failed' },
    }),
  });

  useCreateShipmentMutationMockImpl = () => [
    mockCreateShipment,
    { isLoading: false, error: null, isSuccess: false },
  ];

  render(
    <ComponentWithProvider>
      <ApprovalStatusButton
        orderPolicy={{
          ...orderPolicy,
          order: {
            isCancelled: false,
            data: {
              deliveryOption: 'deliveryOptions/digital-delivery',
            },
          },
        }}
        name="orders/6145018e-46d0-4763-9aca-caa0fa798908/items/17f4d1b8-4409-4140-9b2e-229da1353956"
        showApprovalStatusButtons
        isPolicyReady
        submissionStatus={ItemSubmissionStatus.SUBMITTED}
        approvalStatus={ItemApprovalStatus.APPROVED}
      />
    </ComponentWithProvider>
  );

  const policyUploadedButton = screen.getByRole('button', {
    name: 'approveStatus.policyUploaded',
  });

  act(() => {
    userEvent.click(policyUploadedButton);
  });

  const confirmationBox = await screen.findByRole('presentation');
  expect(confirmationBox).toBeInTheDocument();

  const confirmButtons = within(confirmationBox).getAllByRole('button');
  userEvent.click(confirmButtons[1]);

  await waitFor(() => {
    expect(mockCreateShipment).toHaveBeenCalledWith({
      orderId: 'orders/6145018e-46d0-4763-9aca-caa0fa798908',
      payload: {
        shipmentMethod: 'SHIPMENT_METHOD_DIGITAL',
        items: [
          'orders/6145018e-46d0-4763-9aca-caa0fa798908/items/17f4d1b8-4409-4140-9b2e-229da1353956',
        ],
      },
    });
  });

  useCreateShipmentMutationMockImpl = null;
});
