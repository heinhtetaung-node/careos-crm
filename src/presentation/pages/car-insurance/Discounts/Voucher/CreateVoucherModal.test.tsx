import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { useCreateVoucherMutation } from 'data/slices/discountSlice';

import CreateVoucherModal from './CreateVoucherModal';

const initialState = {
  authReducer: {
    data: {
      user: {
        name: 'users/ee139ec2-5c0d-4877-83d1-174ade5f932e',
        role: 'roles/sales',
      },
    },
  },
};

const mockCloseFn = jest.fn();
const mockSuccessFn = jest.fn();
const mockCreateVoucher = useCreateVoucherMutation as jest.Mock;
var mockShowErrorSnackbar: jest.Mock;

jest.mock('data/slices/discountSlice', () => ({
  ...jest.requireActual('data/slices/discountSlice'),
  useCreateVoucherMutation: jest
    .fn()
    .mockReturnValue([jest.fn(), { data: {} }]),
}));

jest.mock('utils/snackbar', () => {
  mockShowErrorSnackbar = jest.fn();
  return jest
    .fn()
    .mockReturnValue({ showErrorSnackbar: mockShowErrorSnackbar });
});

describe('Testing Voucher Modal', () => {
  beforeEach(() => {
    render(
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <CreateVoucherModal
          handleSuccess={mockSuccessFn}
          handleClose={mockCloseFn}
        />
      </MuiPickersUtilsProvider>,
      {
        initialState,
      }
    );
  });
  it('should show voucher modal', () => {
    expect(screen.getByTestId('discount-voucher-modal')).toBeInTheDocument();
  });
  it('should close the modal on click of cancel button', async () => {
    await userEvent.click(
      screen.getAllByRole('button', { name: 'text.cancelButton' })[0]
    );

    expect(mockCloseFn).toHaveBeenCalled();
  });
});

const renderAndInputValues = () => {
  jest.useFakeTimers().setSystemTime(new Date('2020-01-01'));
  render(
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <CreateVoucherModal
        handleSuccess={mockSuccessFn}
        handleClose={mockCloseFn}
      />
    </MuiPickersUtilsProvider>,
    {
      initialState,
    }
  );
  const name = screen.getByTestId('input-humanName');
  const voucherCode = screen.getByTestId('input-code');
  const voucherPrice = screen.getByTestId('input-price');
  const quantity = screen.getByTestId('input-quantity');

  userEvent.type(name, 'ABC');
  userEvent.click(screen.getAllByRole('button')[0]);
  userEvent.click(screen.getAllByRole('button')[12]);

  userEvent.click(screen.getAllByRole('button')[1]);
  userEvent.click(screen.getAllByRole('button')[13]);

  userEvent.type(voucherCode, '012');
  userEvent.type(voucherPrice, '12');
  userEvent.type(quantity, '12');
};

describe('Testing CreateVoucher with error response', () => {
  it('should create voucher with success', async () => {
    mockCreateVoucher.mockReturnValue([
      jest.fn(),
      { data: { name: 'asd' }, isSuccess: true },
    ]);
    renderAndInputValues();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'text.save' })).toBeEnabled();
    });
    userEvent.click(screen.getByRole('button', { name: 'text.save' }));
    expect(mockCloseFn).toHaveBeenCalled();
    expect(mockSuccessFn).toHaveBeenCalled();
  });
  it('should create voucher with error code 3', async () => {
    mockCreateVoucher.mockReturnValue([
      jest.fn(),
      { error: { data: { message: 'Error', code: 3 } }, isError: true },
    ]);
    renderAndInputValues();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'text.save' })).toBeEnabled();
    });
    userEvent.click(screen.getByRole('button', { name: 'text.save' }));

    expect(mockShowErrorSnackbar).toHaveBeenCalledWith('text.errorMessage');
  });
});
