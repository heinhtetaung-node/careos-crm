import customerData from '@alphafounders/mock-data/json/orderData.json';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import ContactInformationSection from './contactInformationSection';

jest.mock('data/slices/customerSlice', () => ({
  ...jest.requireActual('data/slices/customerSlice'),
  useDeletePhoneNumberMutation: jest.fn().mockReturnValue([
    jest.fn(),
    {
      data: {},
      isLoading: false,
      isSuccess: true,
      isError: false,
    },
  ]),
}));
jest.mock('data/slices/authSlice', () => ({
  ...jest.requireActual('data/slices/authSlice'),
  useGetAuthenticateQuery: jest.fn().mockReturnValue({
    data: {
      role: 'roles/admin',
    },
  }),
}));

describe('Testing CustomerInformationSection Component', () => {
  it('should render all phones and emails', async () => {
    const mockRefetch = jest.fn();
    render(
      <ContactInformationSection
        contacts={{
          emails: customerData.orderItems.customer.emails,
          phones: customerData.orderItems.customer.phones,
        }}
        refetchContacts={mockRefetch}
      />
    );
    const totalLength =
      customerData.orderItems.customer.phones.length +
      customerData.orderItems.customer.emails.length;

    expect(screen.getAllByTestId('dropdownButtonList').length).toEqual(
      totalLength
    );

    await waitFor(() => {
      expect(screen.getAllByTestId('deletePhoneBtn')[0]).toBeEnabled();
    });
    userEvent.click(screen.getAllByTestId('deletePhoneBtn')[0]);

    await waitFor(() => {
      expect(screen.getByTestId('deletePhoneModal')).toBeInTheDocument();
    });

    userEvent.click(screen.getByTestId('confirmDeleteButton'));

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
  it('should not render phones or emails', () => {
    render(
      <ContactInformationSection
        contacts={{
          emails: [] as any,
          phones: [] as any,
        }}
      />
    );
    expect(screen.getAllByTestId('noData').length).toBe(2);
  });
});
