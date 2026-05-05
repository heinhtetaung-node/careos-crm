import user from '@testing-library/user-event';
import { HttpResponse, delay, http } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import CouponModal from '.';

var mockedShowSnackBar: jest.Mock;
jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
  };
});
jest.mock('shared/helper/utilities', () => ({
  ...jest.requireActual('shared/helper/utilities'),
  getLeadIdFromPath: jest.fn().mockReturnValue('leadId'),
}));

const voucherEndpoint = `${process.env.VITE_GO_GATEWAY_ENDPOINT}/v1alpha1/leads/leadId:addVoucher`;

describe('<CouponModal />', () => {
  beforeEach(() => mockedShowSnackBar.mockClear());

  test('should show loading on button until api resolve', async () => {
    server.use(
      http.post(voucherEndpoint, async ({ request }) => {
        await delay(200);
        return HttpResponse.json({ req: await request.json() });
      })
    );
    render(<CouponModal close={jest.fn()} leadStatus="" />);
    await user.type(screen.getByRole('textbox'), 'CouponCode');
    const confirmBtn = screen.getByRole('button', { name: 'text.apply' });
    await user.click(confirmBtn);
    expect(confirmBtn).toBeDisabled();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('should show success snapbar if api success', async () => {
    server.use(
      http.post(voucherEndpoint, async ({ request }) =>
        HttpResponse.json({ req: await request.json() })
      )
    );
    render(<CouponModal close={jest.fn()} leadStatus="" />);
    await user.type(screen.getByRole('textbox'), 'CouponCode');
    const confirmBtn = screen.getByRole('button', { name: 'text.apply' });
    await user.click(confirmBtn);
    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.addCouponSuccess',
        status: 'success',
      });
    });
  });

  test('should show error snapbar if api fail', async () => {
    server.use(
      http.post(voucherEndpoint, async ({ request }) =>
        HttpResponse.json({ req: await request.json() }, { status: 500 })
      )
    );
    render(<CouponModal close={jest.fn()} leadStatus="" />);
    await user.type(screen.getByRole('textbox'), 'CouponCode');
    const confirmBtn = screen.getByRole('button', { name: 'text.apply' });
    await user.click(confirmBtn);
    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.invalidCoupon',
        status: 'error',
      });
    });
  });

  test('should show lead not sync error snapbar if api fail with status 424', async () => {
    server.use(
      http.post(voucherEndpoint, async ({ request }) =>
        HttpResponse.json({ req: await request.json() }, { status: 424 })
      )
    );
    render(<CouponModal close={jest.fn()} leadStatus="" />);
    await user.type(screen.getByRole('textbox'), 'CouponCode');
    const confirmBtn = screen.getByRole('button', { name: 'text.apply' });
    await user.click(confirmBtn);
    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.leadIsNotSync',
        status: 'error',
      });
    });
  });
});
