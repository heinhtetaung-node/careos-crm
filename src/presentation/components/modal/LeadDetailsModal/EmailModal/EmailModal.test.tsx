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

import EmailModal from '.';

const close = jest.fn();
describe('EmailModal', () => {
  const mockedApiHandler = jest.fn();

  beforeEach(() => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) =>
          HttpResponse.json(mockedApiHandler(await request.json()))
      )
    );
  });
  it('calls the updateCustomerDetail', async () => {
    const { getByTestId } = render(
      <Provider store={store as any}>
        <EmailModal close={close} />
      </Provider>
    );

    await act(async () => {
      fireEvent.change(getByTestId('email-input'), {
        target: { value: 'abc@gmail.com' },
      });
    });

    await act(async () => {
      fireEvent.click(getByTestId('submit-button'));
    });

    expect(getByTestId('email-modal')).toBeTruthy();
    expect(close).toHaveBeenCalled();
  });
  it('should show loading text if api triggered', async () => {
    const { getByTestId } = render(
      <Provider store={store as any}>
        <EmailModal close={close} />
      </Provider>
    );

    await act(async () => {
      fireEvent.change(getByTestId('email-input'), {
        target: { value: 'abc@gmail.com' },
      });
    });

    await act(async () => {
      fireEvent.click(getByTestId('submit-button'));
    });

    waitFor(() => {
      const loadingBtn = screen.getByRole('button', { name: 'text.isLoading' });
      expect(loadingBtn).toBeDisabled();
      expect(loadingBtn).toBeInTheDocument();
    });

    expect(close).toHaveBeenCalled();
  });
  it('should trigger to add email to customer as well as to lead ', async () => {
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
        <EmailModal
          close={close}
          customerId="customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda"
        />
      </Provider>
    );

    await act(async () => {
      fireEvent.change(getByTestId('email-input'), {
        target: { value: 'abc@gmail.com' },
      });
    });

    await act(async () => {
      fireEvent.click(getByTestId('submit-button'));
    });

    await waitFor(() => {
      expect(mockedApiHandler).toHaveBeenCalledWith([
        {
          op: 'add',
          path: '/customerEmail',
          value: ['abc@gmail.com'],
        },
      ]);
    });
    await waitFor(() => {
      expect(mockedCustomerApiHandler).toHaveBeenCalledWith({
        email: 'abc@gmail.com',
      });
    });
    expect(close).toHaveBeenCalled();
  });
});
