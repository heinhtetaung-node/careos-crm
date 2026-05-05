import user from '@testing-library/user-event';
import React from 'react';

import {
  render,
  screen,
  waitFor,
  act,
  waitForElementToBeRemoved,
} from '__tests__/rtl-test-utils';
import { MockAccountProductData } from 'mock-data/AccountCurrentProduct.mock';
import LeadDetailsSections from './leadDetailsSections';

// Mock the useFetchPolicies hook
jest.mock('presentation/hooks/useFetchPolicies/useFetchPolicies', () => ({
  useFetchPolicies: jest.fn(() => MockAccountProductData),
}));

const fakeInsurers = [
  {
    name: 'insurers/42',
    displayName: 'Dhipaya',
    title: 'Dhipaya',
    order: 3,
    id: 42,
  },
  {
    name: 'insurers/40',
    displayName: 'Chubb Samaggi Insurance Co. (PLC)',
    title: 'Chubb Samaggi Insurance Co. (PLC)',
    order: 3,
    id: 40,
  },
  {
    name: 'insurers/38',
    displayName: 'Roojai Insurance',
    title: 'Roojai Insurance',
    order: 3,
    id: 38,
  },
];

const props = {
  id: '686d7238-2e89-4cca-b32e-6276c8c78399',
  classes: { grid: '' },
  carInfo: '',
  isPageDisabled: false,
  preferredInsurersList: fakeInsurers,
  isPendingRejection: false,
};

const initialState = {
  leadsDetailReducer: {
    lead: {
      payload: {
        name: 'name/leadId',
        data: {
          insuranceKind: 'voluntary',
          carSubModelYear: '2021',
          checkout: { installments: 1, package: 'package/123' },
          customerFirstName: 'firstName',
          customerLastName: 'lastName',
          customerDOB: '1999-12-12',
        },
      },
    },
  },
};

jest.mock('data/slices/authSlice', () => ({
  ...jest.requireActual('data/slices/authSlice'),
  useGetAuthenticateQuery: jest.fn().mockReturnValue({
    data: {
      name: 'users/be61ecdf-9a1e-4722-bbb2-8bcb063a3844',
      createTime: '2022-03-10T10:10:57.624899Z',
      updateTime: '2022-06-17T07:50:21.991603Z',
      deleteTime: null,
      createBy: 'users/20d37cbe-feb6-44e9-9527-3d789a2949b8',
      humanId: 'hxan619@gmail.com',
      role: 'roles/admin',
      firstName: 'Hasnain',
      lastName: 'Tariq',
      annotations: {},
      loginTime: '2022-06-17T07:50:21.989699Z',
    },
  }),
}));

describe('Testing LeadDetailsSections when customer isnt mapped', () => {
  beforeEach(() => {
    render(<LeadDetailsSections {...props} />, { initialState });
  });

  it('should render LeadDetailsSections', () => {
    expect(screen.getByTestId('lead-detail-section')).toBeInTheDocument();
  });

  it('should request for quote update', () => {
    const btn = screen.getByRole('button', {
      name: 'text.requestCustomPackage',
    });
    expect(btn).toBeInTheDocument();
    btn.click();

    waitFor(() => {
      expect(btn).not.toBeInTheDocument();
    });
  });
});

describe.skip('Testing LeadDetailsSections for extra lead details', () => {
  it('should open the JSON data section when clicked on extra detail button', async () => {
    render(<LeadDetailsSections {...props} />, {
      leadsDetailReducer: {
        lead: {
          payload: {
            name: 'name/leadId',
            source: 'source/42b1c070-db16-4799-8aa2-21bfae9e75e5',
            data: {
              insuranceKind: 'voluntary',
              carSubModelYear: '2021',
              checkout: { installments: 1, package: 'package/123' },
              customerFirstName: 'firstName',
              customerLastName: 'lastName',
              customerDOB: '1999-12-12',
              numberOfFixedDriver: 1,
            },
          },
        },
      },
    });

    await waitForElementToBeRemoved(screen.getAllByRole('progressbar'));

    const extraDetailBtn = screen.getByTestId('lead--extra--detail-button');
    expect(extraDetailBtn).toBeInTheDocument();

    act(async () => {
      await user.click(extraDetailBtn);
    });

    await waitFor(() => {
      expect(screen.getByTestId('lead-extra-json-details')).toBeInTheDocument();
    });
  });
});
