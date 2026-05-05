import user from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';

import { server } from '__mocks__/server';
import { render, screen, waitFor, within } from '__tests__/rtl-test-utils';

import PolicyHolderInformation from './index';

const getInitialState = (
  policyHolderType: string,
  addPolicyAddress = false,
  fixedDriver = 0
) => ({
  leadsDetailReducer: {
    lead: {
      payload: {
        name: 'leads/name',
        data: {
          policyHolderType,
          customerFirstName: 'customerFirst',
          customerLastName: 'customerLast',
          customerPolicyAddress: addPolicyAddress
            ? [
                {
                  firstName: 'first',
                  lastName: 'last',
                  taxId: 'taxid',
                  companyName: 'companyName',
                },
              ]
            : [],
          numberOfFixedDriver: fixedDriver,
          firstDriverFirstName: 'fixedDriverOneFirstName',
          firstDriverLastName: 'fixedDriverOneLastName',
          secondDriverFirstName: 'fixedDriverTwoFirstName',
          secondDriverLastName: 'fixedDriverTwoLastName',
        },
      },
    },
  },
});

const mockedLeadUpdateHandler = jest.fn();
describe('<PolicyHolderInformation /> refactored', () => {
  beforeEach(() => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/name:patchData`,
        async ({ request }) =>
          HttpResponse.json(mockedLeadUpdateHandler(await request.json()))
      )
    );
    mockedLeadUpdateHandler.mockClear();
  });

  test('test the required fields are present when the policyHolderType is customer', () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('customer'),
    });
    expect(screen.getByText('leadDetailFields.title')).toBeInTheDocument();
    expect(screen.getByText('leadDetailFields.firstName')).toBeInTheDocument();
    expect(screen.getByText('leadDetailFields.lastName')).toBeInTheDocument();

    expect(screen.getByText('leadDetailFields.dob')).toBeInTheDocument();
    expect(
      screen.getByText('leadDetailFields.fixedDriver')
    ).toBeInTheDocument();
  });

  test('test the required fields are present when the policyHolderType is straw_buyer', () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('straw_buyer'),
    });
    expect(screen.getByText('leadDetailFields.title')).toBeInTheDocument();
    expect(screen.getByText('leadDetailFields.firstName')).toBeInTheDocument();
    expect(screen.getByText('leadDetailFields.lastName')).toBeInTheDocument();
    expect(
      screen.getByText('leadDetailFields.nationalIdPassport')
    ).toBeInTheDocument();
    expect(screen.getByText('leadDetailFields.dob')).toBeInTheDocument();
    expect(
      screen.getByText('leadDetailFields.fixedDriver')
    ).toBeInTheDocument();
  });

  test('test the required fields are present when the policyHolderType is company', () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('company'),
    });
    expect(
      screen.getByText('leadDetailFields.companyName')
    ).toBeInTheDocument();
    expect(screen.getByText('leadDetailFields.taxId')).toBeInTheDocument();
    expect(
      screen.getByText('leadDetailFields.fixedDriver')
    ).toBeInTheDocument();
  });

  test('should call api to change customerType', async () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('straw_buyer', true),
    });

    await user.click(screen.getByTestId('radio-policyHolderType-customer'));

    await waitFor(() =>
      expect(mockedLeadUpdateHandler).toHaveBeenCalledWith([
        {
          op: 'add',
          path: '/policyHolderType',
          value: 'customer',
        },
        {
          op: 'remove',
          path: '/customerPolicyAddress/0/companyName',
          value: null,
        },
        { op: 'remove', path: '/customerPolicyAddress/0/taxId', value: null },
        {
          op: 'add',
          path: '/policyHolderFirstName',
          value: 'customerFirst',
        },
        {
          op: 'add',
          path: '/policyHolderLastName',
          value: 'customerLast',
        },
        {
          op: 'add',
          path: '/customerPolicyAddress/0/firstName',
          value: 'customerFirst',
        },
        {
          op: 'add',
          path: '/customerPolicyAddress/0/lastName',
          value: 'customerLast',
        },
        {
          op: 'add',
          path: '/customerPolicyAddress/0/addressType',
          value: 'personal',
        },
      ])
    );
  });

  test('should not call api to change customerType if the field is disabled', async () => {
    render(<PolicyHolderInformation isFieldDisabled />, {
      initialState: getInitialState('straw_buyer'),
    });

    expect(
      screen.getByTestId('radio-policyHolderType-customer')
    ).toBeDisabled();
  });

  test('should call lead updater on policyHolder switch', async () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('straw_buyer', true),
    });

    await user.click(screen.getByTestId('radio-policyHolderType-customer'));
    await waitFor(() => expect(mockedLeadUpdateHandler).toHaveBeenCalled());
  });

  test.skip('should also update policyAddress firstName and lastName if policyAddress is present and policyHolderType is straw_buyer', async () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('straw_buyer', true),
    });
    screen.getByTestId('policyHolderFirstName-input').focus();
    await user.paste('abcd');
    await user.tab();
    await waitFor(() =>
      expect(mockedLeadUpdateHandler).toHaveBeenCalledWith([
        { op: 'add', path: '/policyHolderFirstName', value: 'abcd' },
        {
          op: 'add',
          path: '/customerPolicyAddress/0/firstName',
          value: 'abcd',
        },
      ])
    );
  });

  test.skip('should call lead updater on policyHolder lastname update', async () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('straw_buyer', true),
    });
    screen.getByTestId('policyHolderLastName-input').focus();
    await user.paste('abcd');
    await user.tab();
    await waitFor(() => expect(mockedLeadUpdateHandler).toHaveBeenCalled());
  });

  test.skip('should call lead updater on policyHolder nationalId update', async () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('straw_buyer', true),
    });
    screen.getByTestId('policyHolderNationalId-input').focus();
    await user.paste('abcd');
    await user.tab();
    await waitFor(() => expect(mockedLeadUpdateHandler).toHaveBeenCalled());
  });

  test.skip('should call lead updater on policyHolder company update', async () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('company', true),
    });
    screen.getByTestId('policyHolderCompanyName-input').focus();
    await user.paste('abcd');
    await user.tab();
    await waitFor(() => expect(mockedLeadUpdateHandler).toHaveBeenCalled());
  });

  test.skip('should call lead updater on policyHolder taxId update', async () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('company', true),
    });
    screen.getByTestId('policyHolderTaxId-input').focus();
    await user.paste('abcd');
    await user.tab();
    await waitFor(() => expect(mockedLeadUpdateHandler).toHaveBeenCalled());
  });

  test('should call lead updater on policyHolder policyTitle change', async () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('straw_buyer', true),
    });
    const row = within(screen.getByTestId('policyTitle'));
    await user.click(row.getByRole('textbox'));
    const options = within(screen.getByRole('presentation'));
    await user.click(options.getByRole('option', { name: 'text.mrs' }));
    await waitFor(() => expect(mockedLeadUpdateHandler).toHaveBeenCalled());
  });

  test('should not display first driver name', async () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('straw_buyer', true),
    });

    expect(
      screen.queryByTestId('firstDriverName-labelWithIcon')
    ).not.toBeInTheDocument();
  });
});

describe('<PolicyHolderInformation /> with FixedDriverModal', () => {
  beforeEach(() => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/lead/v1alpha2/leads/name:patchData`,
        async ({ request }) =>
          HttpResponse.json(mockedLeadUpdateHandler(await request.json()))
      )
    );

    mockedLeadUpdateHandler.mockClear();
  });

  test('should display fixedDriverModal when numberOfFixedDriver changes', async () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('straw_buyer', true),
    });

    const row = within(screen.getByTestId('policyNumberOfFixedDriver'));
    const fixedDriverTextBox = row.getByRole('textbox') as HTMLInputElement;
    await user.click(fixedDriverTextBox);
    const options = within(screen.getByRole('presentation'));
    await user.click(options.getAllByRole('option')[2]);

    await waitFor(() => {
      expect(mockedLeadUpdateHandler).toHaveBeenCalledWith([
        {
          op: 'add',
          path: '/numberOfFixedDriver',
          value: 2,
        },
      ]);
      expect(screen.getByTestId('fixed-driver-modal')).toBeInTheDocument();
    });
  });

  test('should display fixedDriverModal when click on labelWithIcon', async () => {
    render(<PolicyHolderInformation isFieldDisabled={false} />, {
      initialState: getInitialState('straw_buyer', true, 2),
    });

    // First driver
    const firstFixedDriverFullName = screen.getByTestId(
      'firstFixedDriverFullName'
    );
    expect(firstFixedDriverFullName).toBeInTheDocument();
    expect(
      screen.getByText('fixedDriverOneFirstName fixedDriverOneLastName')
    ).toBeInTheDocument();
    await user.click(screen.getByTestId('firstDriverName-labelWithIcon'));
    expect(screen.getByTestId('fixed-driver-modal')).toBeInTheDocument();

    // Second driver
    const secondFixedDriverFullName = screen.getByTestId(
      'secondFixedDriverFullName'
    );
    expect(secondFixedDriverFullName).toBeInTheDocument();
    expect(
      screen.getByText('fixedDriverTwoFirstName fixedDriverTwoLastName')
    ).toBeInTheDocument();
    await user.click(screen.getByTestId('secondDriverName-labelWithIcon'));
    expect(screen.getByTestId('fixed-driver-modal')).toBeInTheDocument();
  });
});
