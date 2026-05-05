import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';

import { PurchasingPurposes } from '../PolicyHolderInformation/PolicyHolderInformation.helper';

import Customer from './index';

const getInitialState = (policyHolderType: PurchasingPurposes) => ({
  leadsDetailReducer: {
    lead: {
      payload: {
        name: 'leads/name',
        data: {
          policyHolderType,
          customerPolicyAddress: [{ firstName: 'first', lastName: 'last' }],
        },
      },
    },
  },
});

describe('<Customer />', () => {
  test('should display columns if policyHolderflag is defaulted', () => {
    render(<Customer />, {
      initialState: {
        ...getInitialState(PurchasingPurposes.customerIsNotPolicyHolder),
      },
    });
    expect(
      screen.queryByText('leadDetailFields.firstName')
    ).toBeInTheDocument();
  });

  test.skip('should update policyAddress firstname and lastname if policyHolder is customer and customer name is updated', async () => {
    const mockedLeadUpdateHandler = jest.fn();
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/name:patchData`,
        async ({ request }) =>
          HttpResponse.json(mockedLeadUpdateHandler(await request.json()))
      )
    );
    render(<Customer />, {
      initialState: {
        ...getInitialState(PurchasingPurposes.customerIsPolicyHolder),
      },
    });
    screen.getByTestId('customerFirstName-input').focus();
    await user.paste('firstName');
    await user.tab();
    await waitFor(() => {
      expect(mockedLeadUpdateHandler).toHaveBeenCalledWith([
        { op: 'add', path: '/customerFirstName', value: 'firstName' },
        { op: 'add', path: '/policyHolderFirstName', value: 'firstName' },
        {
          op: 'add',
          path: '/customerPolicyAddress/0/firstName',
          value: 'firstName',
        },
      ]);
    });
    screen.getByTestId('customerLastName-input').focus();
    await user.paste('lastName');
    await user.tab();
    await waitFor(() => {
      expect(mockedLeadUpdateHandler).toHaveBeenCalledWith([
        { op: 'add', path: '/customerLastName', value: 'lastName' },
        { op: 'add', path: '/policyHolderLastName', value: 'lastName' },
        {
          op: 'add',
          path: '/customerPolicyAddress/0/lastName',
          value: 'lastName',
        },
      ]);
    });
    within(screen.getByTestId('date-picker-with-thai-year'))
      .getByRole('textbox')
      .focus();
    await user.paste('01011999');
    await user.tab();
    await waitFor(() => {
      expect(mockedLeadUpdateHandler).toHaveBeenCalledWith([
        { op: 'add', path: '/customerDOB', value: '1999-01-01' },
        { op: 'add', path: '/policyHolderDOB', value: '1999-01-01' },
      ]);
    });
  });

  test.skip('should clear the validation error on field value change', async () => {
    render(<Customer />, {
      initialState: {
        ...getInitialState(PurchasingPurposes.customerIsNotPolicyHolder),
        pageErrorReducer: {
          leadDetailErrors: {
            locale: 'locale required',
            customerFirstName: 'customer firstName required',
            customerLastName: 'customer lastName required',
            customerDOB: 'customer DOB required',
          },
        },
      },
    });
    expect(screen.getByText('locale required')).toBeInTheDocument();
    expect(screen.getByText('customer firstName required')).toBeInTheDocument();
    expect(screen.getByText('customer lastName required')).toBeInTheDocument();
    expect(screen.getByText('customer DOB required')).toBeInTheDocument();
    await user.click(screen.getByTestId('option-TH'));
    screen.getByTestId('customerFirstName-input').focus();
    await user.paste('firstName');
    screen.getByTestId('customerLastName-input').focus();
    await user.paste('lastName');
    within(screen.getByTestId('date-picker-with-thai-year')).getByRole(
      'textbox'
    );
    await user.paste('01011999');
    await user.tab();
    expect(screen.queryByText('locale required')).not.toBeInTheDocument();
    expect(
      screen.queryByText('customer firstName required')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('customer lastName required')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('customer DOB required')).not.toBeInTheDocument();
  });
});
