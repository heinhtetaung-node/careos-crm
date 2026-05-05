import { http, HttpResponse } from 'msw';
import React from 'react';
import { Provider } from 'react-redux';

import { server } from '__mocks__/server';
import {
  fireEvent,
  render,
  waitFor,
  act,
  screen,
} from '__tests__/rtl-test-utils';
import { store } from 'presentation/redux/store';

import OrderEmailModal from '.';

var mockedShowSnackBar: jest.Mock;
jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackBar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackBar,
  };
});

const close = jest.fn();

describe.skip('Test OrderEmailModal', () => {
  beforeEach(() => {
    mockedShowSnackBar.mockClear();
  });

  it('should show loading text if api triggered', async () => {
    const { getByTestId } = render(
      <Provider store={store as any}>
        <OrderEmailModal close={close} />
      </Provider>
    );

    await act(async () => {
      fireEvent.change(getByTestId('order-email-input'), {
        target: { value: 'abc@gmail.com' },
      });
    });

    await act(async () => {
      fireEvent.click(getByTestId('order-submit-button'));
    });

    waitFor(() => {
      const loadingBtn = screen.getByRole('button', { name: 'text.isLoading' });
      expect(loadingBtn).toBeDisabled();
      expect(loadingBtn).toBeInTheDocument();
    });

    expect(close).toHaveBeenCalled();
  });
  it('should trigger to add email to customer as well as to order ', async () => {
    const mockedCustomerApiHandler = jest.fn();

    server.use(
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda/emails`,
        async ({ request }) =>
          HttpResponse.json(mockedCustomerApiHandler(await request.json()))
      )
    );

    const { getByTestId } = render(
      <Provider store={store as any}>
        <OrderEmailModal
          close={close}
          customerId="customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda"
        />
      </Provider>
    );

    await act(async () => {
      fireEvent.change(getByTestId('order-email-input'), {
        target: { value: 'abc@gmail.com' },
      });
    });

    await act(async () => {
      fireEvent.click(getByTestId('order-submit-button'));
    });

    await waitFor(() => {
      expect(mockedCustomerApiHandler).toHaveBeenCalledWith({
        email: 'abc@gmail.com',
      });

      expect(close).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockedShowSnackBar).toHaveBeenCalledWith({
        isOpen: true,
        message: 'text.addEmailSuccess',
        status: 'success',
      });
    });
  });
});
