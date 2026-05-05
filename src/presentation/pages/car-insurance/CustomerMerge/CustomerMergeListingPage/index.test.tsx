import userEvent from '@testing-library/user-event';
import React from 'react';

import { act, render, screen, waitFor } from '__tests__/rtl-test-utils';
import MockData from 'shared/helper/mockData';
import getApiEndpoint from 'utils/endpointHelper';

import CustomerMergeDashBoard from '.';

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
jest.mock('data/slices/customerSlice', () => ({
  ...jest.requireActual('data/slices/customerSlice'),
  useLazyGetCustomerProfilesQuery: jest.fn(() => [
    jest.fn(),
    {
      data: {
        imports: MockData.getCustomerProfiles(),
      },

      isLoading: false,
      isError: false,
      isFetching: false,
    },
  ]),
}));

const mockErrorShow = jest.fn();

jest.mock('utils/snackbar', () =>
  jest.fn().mockImplementation(() => ({
    showErrorSnackbar: mockErrorShow,
  }))
);

describe('Testing Discount Approval Page', () => {
  beforeEach(() => {
    render(<CustomerMergeDashBoard />, { initialState });
  });

  it('should render ApprovalPage', () => {
    expect(screen.getByTestId('customer-merge-dashboard')).toBeInTheDocument();
  });
  it.skip('should not be able to select more than 2 customers', async () => {
    const checkBoxes = screen.getAllByTestId('data-checkbox');
    expect(checkBoxes.length).toBe(3);
    act(() => {
      userEvent.click(checkBoxes[0]);
      userEvent.click(checkBoxes[1]);
      userEvent.click(checkBoxes[2]);
    });

    expect(mockErrorShow).toHaveBeenCalledWith(
      'customerMerge.limitExceedError'
    );
  });
  it.skip('should be able to merge customer if 2 customers are selected', async () => {
    const checkBoxes = screen.getAllByTestId('data-checkbox');
    expect(checkBoxes.length).toBe(3);

    act(() => {
      userEvent.click(checkBoxes[0]);
      userEvent.click(checkBoxes[1]);
    });

    const mergeBtn = screen.getAllByRole('button', {
      name: 'customerMerge.mergeButtonText',
    })[0];

    expect(mergeBtn).toBeEnabled();
    userEvent.click(mergeBtn);
    await waitFor(() => {
      expect(screen.getByTestId('redirect-btn').getAttribute('href')).toBe(
        getApiEndpoint(
          '/customers-merge/customers?id[]=customers%2Ff3c070f4-6173-453f-b484-a1073066ef3f&customers%2F9c4c33da-911e-4dbc-93ad-ad69448f347d'
        )
      );
    });
  });
});
