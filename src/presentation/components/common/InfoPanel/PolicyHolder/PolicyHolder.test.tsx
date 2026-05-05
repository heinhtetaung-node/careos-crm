import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';

import { render, screen } from '__tests__/rtl-test-utils';
import GetAddressHelper from 'shared/helper/getAddress';
import {
  getMockOrder,
  getMockOrderCompany,
  getPolicyHolder,
} from 'shared/helper/OrderMockData';
import { getTitle } from 'shared/helper/selectOptions';

import PolicyHolder from '.';

const mockStore = configureMockStore();

describe.skip('Render PolicyHolder', () => {
  it('editable content', async () => {
    const initialState = {
      order: {
        payload: getMockOrder(),
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store as any}>
        <PolicyHolder policyHolder={getPolicyHolder()} isEditable />
      </Provider>
    );
    const textboxes = screen.getAllByRole('textbox');

    await waitFor(() => {
      expect(screen.getByText('order.policyholder')).toBeTruthy();
      expect(
        screen.getByText('qc.customerIsNotInsuredPerson')
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(textboxes).toBeTruthy();
    });
  });

  it('editable content with company policy holder', async () => {
    const order = getMockOrderCompany();
    const initialState = {
      order: {
        payload: order,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store as any}>
        <PolicyHolder policyHolder={order.data.policyHolder} isEditable />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('order.policyholder')).toBeTruthy();
    });
  });

  it('readonly content with idType is DrivingLicense', async () => {
    const initialState = {
      order: {
        payload: {
          ...getMockOrder(),
          data: {
            ...getMockOrder()?.data,
            idType: 'DrivingLicense',
          },
        },
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store as any}>
        <PolicyHolder policyHolder={getPolicyHolder()} />
      </Provider>
    );
    await waitFor(() => {
      expect(() => screen.getByRole('textbox')).toThrow();
    });
    expect(
      await screen.findByTestId('policy-dob-datefield-readonly')
    ).toBeInTheDocument();
    expect(
      await screen.findByText('leadDetailFields.drivingLicense')
    ).toBeInTheDocument();
  });

  it('readonly content with idType is NationalID', async () => {
    const initialState = {
      order: {
        payload: {
          ...getMockOrder(),
          data: {
            ...getMockOrder()?.data,
            idType: 'NationalID',
          },
        },
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store as any}>
        <PolicyHolder policyHolder={getPolicyHolder()} />
      </Provider>
    );
    expect(
      await screen.findByText('leadDetailFields.nationalId')
    ).toBeInTheDocument();
  });

  it('readonly content with idType is Passport', async () => {
    const initialState = {
      order: {
        payload: {
          ...getMockOrder(),
          data: {
            ...getMockOrder()?.data,
            idType: 'Passport',
          },
        },
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store as any}>
        <PolicyHolder policyHolder={getPolicyHolder()} />
      </Provider>
    );
    expect(
      await screen.findByText('leadDetailFields.passport')
    ).toBeInTheDocument();
  });

  it('PolicyHolder handle update personal', async () => {
    const initialState = {
      order: {
        payload: getMockOrder(),
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store as any}>
        <PolicyHolder policyHolder={getPolicyHolder()} isEditable />
      </Provider>
    );
    const input = screen.getByTestId('policy-first-name-input');

    userEvent.type(input, 'First{enter}');
    await waitFor(() => {
      expect(input).toHaveValue('PuiPolicies AFirst');
    });
  });

  it('PolicyHolder handle update company', async () => {
    const order = getMockOrderCompany();
    const initialState = {
      order: {
        payload: order,
      },
    };
    const store = mockStore(initialState);
    render(
      <Provider store={store as any}>
        <PolicyHolder policyHolder={order.data.policyHolder} isEditable />
      </Provider>
    );

    const input = screen.getByTestId('policy-company-name-input');
    userEvent.clear(input);
    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});

describe('Check Policy Holder helper functions', () => {
  it('getTitle returns title if valid data passed', () => {
    expect(getTitle('MR')).toEqual('text.mr');
  });
  it('getTitle returns title value if valid data passed', () => {
    expect(getTitle('MR', true)).toEqual('MR');
  });
  it('getTitle returns empty string if no date is passed', () => {
    expect(getTitle('')).toEqual('');
  });
  it('getAddressForkJoin returns empty string if no data is passed', () => {
    const payload = {
      province: 100000,
      district: 100100,
      subDistrict: 100103,
    };
    const spygetAddress = jest.spyOn(GetAddressHelper, 'getAddressForkJoin');
    GetAddressHelper.getAddressForkJoin(payload as any);
    expect(spygetAddress).toHaveBeenCalled();
  });
});
