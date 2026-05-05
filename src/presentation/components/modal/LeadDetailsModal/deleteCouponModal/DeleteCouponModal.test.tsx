import user from '@testing-library/user-event';
import { HttpResponse, delay, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import DeleteCouponModal from '.';

var mockedShowSnackBar: jest.Mock;
jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({
    type: '[UI] SHOW_SNACKBAR',
    payload: {},
  }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
  };
});

jest.mock('shared/helper/utilities', () => ({
  ...jest.requireActual('shared/helper/utilities'),
  getLeadIdFromPath: jest.fn().mockReturnValue('leadId'),
}));

describe('<CouponModal />', () => {
  beforeEach(() => mockedShowSnackBar.mockClear());

  test('should show loading on button until api resolve', async () => {
    server.use(
      http.post(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/leads/leadId:removeVoucher`,
        async ({ request }) => {
          await delay(200);
          return HttpResponse.json({ req: await request.json() });
        }
      )
    );
    render(<DeleteCouponModal closeModal={jest.fn()} />);
    const confirmBtn = screen.getByRole('button', {
      name: 'text.confirmButton',
    });
    await user.click(confirmBtn);
    expect(confirmBtn).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should show success snapbar if api success', async () => {
    server.use(
      http.post(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/leads/leadId:removeVoucher`,
        async ({ request }) => HttpResponse.json({ req: await request.json() })
      )
    );
    render(<DeleteCouponModal closeModal={jest.fn()} />);
    const confirmBtn = screen.getByRole('button', {
      name: 'text.confirmButton',
    });
    await user.click(confirmBtn);
    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.deleteCouponSuccess',
        status: 'success',
      });
    });
  });

  test('should show error snapbar if api fail', async () => {
    server.use(
      http.post(
        `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/leads/leadId:removeVoucher`,
        () => HttpResponse.json({ message: 'error message' }, { status: 500 })
      )
    );
    render(<DeleteCouponModal closeModal={jest.fn()} />);
    const confirmBtn = screen.getByRole('button', {
      name: 'text.confirmButton',
    });
    await user.click(confirmBtn);
    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'error message',
        status: 'error',
      });
    });
  });
});
