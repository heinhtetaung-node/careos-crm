import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import PhoneModal from './index';

describe('<PhoneModal />', () => {
  test('shoud disable the submit btn if number is invalid', async () => {
    render(<PhoneModal close={jest.fn()} />);
    await user.type(screen.getByRole('textbox'), '09');
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'text.addButton' })
      ).toBeDisabled()
    );
  });
  test.skip('should disable and show loading text if API is in progress', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) => HttpResponse.json(await request.json())
      )
    );
    render(<PhoneModal close={jest.fn()} />);
    await user.type(screen.getByRole('textbox'), '0987654567');
    await user.click(screen.getByRole('button', { name: 'text.addButton' }));
    expect(screen.getByRole('button', { name: 'text.loading' })).toBeDisabled();
  });

  test('should call api with correct endpoint if valid phone no is typed', async () => {
    const mockedApiHandler = jest.fn();
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) =>
          HttpResponse.json(mockedApiHandler(await request.json()))
      )
    );
    render(<PhoneModal close={jest.fn()} />);
    await user.type(screen.getByRole('textbox'), '0987654567');
    await user.click(screen.getByRole('button', { name: 'text.addButton' }));
    await waitFor(() =>
      expect(mockedApiHandler).toHaveBeenCalledWith([
        {
          op: 'add',
          path: '/customerPhoneNumber',
          value: [
            {
              phone: '+66987654567',
              status: 'unverified',
            },
          ],
        },
      ])
    );
  });
  test('should call customer api with correct endpoint if valid phone no is typed', async () => {
    const mockedApiHandler = jest.fn((req: any) => ({ data: req }));
    const mockedCustomerApiHandler = jest.fn();
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/:patchData`,
        async ({ request }) =>
          HttpResponse.json(mockedApiHandler(await request.json()))
      ),
      http.post(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda/phones`,
        async ({ request }) =>
          HttpResponse.json(mockedCustomerApiHandler(await request.json()))
      )
    );
    render(
      <PhoneModal
        close={jest.fn()}
        customerId="customers/14a3cc5b-d618-4bfd-b8c4-1dff15b5cbda"
      />
    );
    await user.type(screen.getByRole('textbox'), '0987654567');
    await user.click(screen.getByRole('button', { name: 'text.addButton' }));
    await waitFor(() => {
      expect(mockedApiHandler).toHaveBeenCalledWith([
        {
          op: 'add',
          path: '/customerPhoneNumber',
          value: [{ phone: '+66987654567', status: 'unverified' }],
        },
      ]);
      expect(mockedCustomerApiHandler).toHaveBeenCalledWith({
        phone: '+66987654567',
      });
    });
  });
});
