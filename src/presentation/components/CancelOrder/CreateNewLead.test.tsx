import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { getString } from 'presentation/theme/localization';
import { mockUseFlags } from 'shared/helper/flagsmith';
import getApiEndpoint, { ServicesName } from 'utils/endpointHelper';

import CancelOrder from './CancelOrder';
import CreateNewLead from './CreateNewLead';

var mockSnackBar: jest.Mock;

const orderItems = [
  {
    name: 'orders/123/items/123',
    insurer: 'insurers/42',
    motorItemType: 'MOTOR_TYPE_2',
    policyStartDate: new Date(),
  },
  {
    name: 'orders/456/items/456',
    insurer: 'insurers/40',
    motorItemType: 'MOTOR_TYPE_1',
    policyStartDate: new Date(),
  },
  {
    name: 'orders/780/items/789',
    insurer: 'insurers/40',
    motorItemType: 'MOTOR_TYPE_1',
    policyStartDate: new Date(),
  },
];

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

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn().mockReturnValue([
    {
      name: 'insurers/42',
      displayName: 'LOL Insurance',
      displayNameTh: 'เอฟพีจี ประกันภัย',
    },
    {
      name: 'insurers/40',
      displayName: 'Chubb Samaggi Insurance Co. (PLC)',
      displayNameTh: 'บริษัท ชับบ์สามัคคีประกันภัย จำกัด (มหาชน)',
    },
  ]),
}));

jest.mock('presentation/redux/actions/ui', () => {
  mockSnackBar = jest.fn((param: any) => ({ type: '', payload: param }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockSnackBar,
  };
});

test('new lead should show after order cancel', async () => {
  server.use(
    http.get(getApiEndpoint('/api/order/v1alpha1/orders/:orderId/items'), () =>
      HttpResponse.json({ items: orderItems, nextPageToken: '' })
    ),
    http.patch(
      getApiEndpoint(
        '/v1alpha1/orders/:orderId/items/:itemId:cancel',
        ServicesName.GFF
      ),
      async ({ request }) => {
        const body: any = await request.json();
        if (body.create_lead) {
          return HttpResponse.json({ leadHumanId: 'L12345' });
        }
        return HttpResponse.json({ leadHumanId: '' });
      }
    )
  );

  render(<CancelOrder orderId="1234" isCancelled={false} />);
  const cancelBtn = screen.getByTestId('cancel-button');
  await userEvent.click(cancelBtn);
  await waitFor(() => {
    expect(screen.getAllByRole('checkbox')).toHaveLength(orderItems.length);
  });
  const checkboxes = screen.getAllByRole('checkbox');

  await userEvent.click(checkboxes[0]);
  await userEvent.click(checkboxes[2]);

  const [cancelReasonInput, commentBox] = screen.getAllByRole('textbox');

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
  await userEvent.tab();
  await waitFor(() => {
    expect(commentBox).toHaveValue('Need to cancel policies');
  });
  expect(screen.getByRole('button', { name: 'text.next' })).toBeEnabled();
  userEvent.click(screen.getByRole('button', { name: 'text.next' }));

  await waitFor(() => {
    expect(screen.getByTestId('create-new-lead')).toBeInTheDocument();
  });

  const radioGroup = screen.getAllByRole('radio');
  await userEvent.click(radioGroup[0]);

  const confirmBtn = await screen.findByRole('button', {
    name: 'text.confirmButton',
  });

  await userEvent.click(confirmBtn);

  await waitFor(() => {
    expect(screen.getByTestId('show-lead-id')).toBeInTheDocument();
    expect(
      screen.getByText(
        getString('createNewLeadModal.creationMessage', {
          leadHumanId: 'L12345',
        })
      )
    ).toBeInTheDocument();
  });
});

test('test change order', async () => {
  mockUseFlags([]);
  server.use(
    http.get(getApiEndpoint('/api/order/v1alpha1/orders/:orderId/items'), () =>
      HttpResponse.json({ items: [orderItems[0]], nextPageToken: '' })
    )
  );

  render(
    <CancelOrder orderId="1234" isCancelled={false} paymentStatus="fullyPaid" />
  );
  const cancelBtn = screen.getByTestId('cancel-button');
  await userEvent.click(cancelBtn);

  // Check checkbox
  const checkboxes = screen.getAllByRole('checkbox');
  await userEvent.click(checkboxes[0]);

  // Fill required fields
  const [cancelReasonInput, commentBox] = screen.getAllByRole('textbox');
  await userEvent.click(cancelReasonInput);
  await userEvent.click(screen.getAllByRole('option')[0]);
  await userEvent.type(commentBox, 'Need to change order');

  // Now button should be enabled
  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'text.next' })).toBeEnabled();
  });
  await userEvent.click(screen.getByRole('button', { name: 'text.next' }));

  await waitFor(() => {
    expect(screen.getByTestId('create-new-lead')).toBeInTheDocument();
  });
});

test('test change order - not show checkbox in case not check all policies', async () => {
  mockUseFlags([]);
  server.use(
    http.get(getApiEndpoint('/api/order/v1alpha1/orders/:orderId/items'), () =>
      HttpResponse.json({ items: orderItems, nextPageToken: '' })
    )
  );

  render(
    <CancelOrder orderId="1234" isCancelled={false} paymentStatus="fullyPaid" />
  );
  const cancelBtn = screen.getByTestId('cancel-button');
  await userEvent.click(cancelBtn);

  // Check only first checkbox
  const checkboxes = screen.getAllByRole('checkbox');
  await userEvent.click(checkboxes[0]);

  // Fill required fields
  const [cancelReasonInput, commentBox] = screen.getAllByRole('textbox');
  await userEvent.click(cancelReasonInput);
  await userEvent.click(screen.getAllByRole('option')[0]);
  await userEvent.type(commentBox, 'Need to change order');

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'text.next' })).toBeEnabled();
  });
  await userEvent.click(screen.getByRole('button', { name: 'text.next' }));

  await waitFor(() => {
    expect(screen.getByTestId('create-new-lead')).toBeInTheDocument();
  });
});

describe('CreateNewLead', () => {
  const mockProps = {
    handleModalToggle: jest.fn(),
    policies: [],
    selectedPolicies: [],
    open: true,
    handleCancelOrder: jest.fn(),
    cancellingPolicy: false,
    showLeadId: false,
    setShowLeadId: jest.fn(),
  };

  it('test change order', async () => {
    render(<CreateNewLead {...mockProps} />);

    // Select "Yes" radio button
    const yesRadio = screen.getByRole('radio', { name: 'text.yes' });
    await userEvent.click(yesRadio);

    await userEvent.tab();

    const confirmButton = screen.getByRole('button', {
      name: 'text.confirmButton',
    });
    await userEvent.click(confirmButton);
  });

  it('test change order - not show checkbox in case not check all policies', async () => {
    render(<CreateNewLead {...mockProps} />);

    // Select "No" radio button
    const noRadio = screen.getByRole('radio', { name: 'text.no' });
    await userEvent.click(noRadio);

    await userEvent.tab();

    const confirmButton = screen.getByRole('button', {
      name: 'text.confirmButton',
    });
    expect(confirmButton).toBeEnabled();
  });
});
