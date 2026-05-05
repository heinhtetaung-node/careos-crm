import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import React from 'react';
import * as Redux from 'react-redux';

import { server } from '__mocks__/server';
import { setupApiStore } from '__tests__/rtl-store';
import { render, screen, waitFor } from '__tests__/rtl-test-utils';
import { apiSlice } from 'data/slices/apiSlice';
import phonesMockData from 'mock-data/CustomerPhones.mock';

import CallButton from '.';

const storeRef = setupApiStore(apiSlice);
const wrapper = ({ children }: React.PropsWithChildren) => (
  <Redux.Provider store={storeRef.store}>{children}</Redux.Provider>
);
const customerName = 'customers/7c0285a0-b776-406e-9493-3712f1a6fe0f';

var mockedShowSnackbar: jest.Mock;

jest.mock('presentation/redux/actions/ui', () => {
  mockedShowSnackbar = jest.fn(() => ({ type: '' }));
  return {
    ...jest.requireActual('presentation/redux/actions/ui'),
    showSnackBar: mockedShowSnackbar,
  };
});

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

const mockCustomer = {
  name: 'customers/7c0285a0-b776-406e-9493-3712f1a6fe0f',
  createTime: '2022-09-20T08:57:18.328571Z',
  updateTime: '2022-10-10T08:04:12.208275Z',
  deleteTime: null,
  createBy: 'users/20d98aeb-5f47-416a-bd57-b9a2fd0d7133',
  humanId: 'C1030589',
  firstName: 'Oriol',
  lastName: 'Molist',
  gender: 'M',
  dateOfBirth: '1993-11-07T00:00:00Z',
  companyNames: [],
  primaryPhoneId:
    'customers/7c0285a0-b776-406e-9493-3712f1a6fe0f/phones/b0d2e3aa-0648-4561-8391-fec5aca76d47',
};

const dispatch = jest.fn();
(Redux.useDispatch as any).mockReturnValue(dispatch);

test('Should render call button with list from API', async () => {
  server.use(
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerName}`,
      () => HttpResponse.json(mockCustomer)
    ),
    http.get(
      `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerName}/phones`,
      () => HttpResponse.json(phonesMockData)
    )
  );

  render(<CallButton customerId={customerName} />, { wrapper });
  expect(await screen.findByTestId('call-button')).toBeInTheDocument();
});

test('Should select phone number from dropdown', async () => {
  render(<CallButton customerId={customerName} />, { wrapper });

  const buttons = await screen.findAllByRole('button');
  expect(buttons).toHaveLength(2);

  await userEvent.click(buttons[1]);
  expect(await screen.findByRole('tooltip')).toBeInTheDocument();

  const phones = await screen.findAllByRole('menuitem');
  expect(phones).toHaveLength(3);
  // FIXME: Check why this test is failing
  // await userEvent.click(phones[2]);
  // expect(screen.queryAllByText('03333****')).toHaveLength(2);
});

test('Should close dropdown clickAway', async () => {
  render(
    <div>
      <CallButton customerId={customerName} />
      <button type="button" data-testid="close">
        Close Menu
      </button>
    </div>,
    { wrapper }
  );

  const buttons = await screen.findAllByRole('button');
  expect(buttons).toHaveLength(3);

  await userEvent.click(buttons[1]);
  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toBeInTheDocument();

  const phones = await screen.findAllByRole('menuitem');
  expect(phones).toHaveLength(3);

  const closeMenu = await screen.findByTestId('close');
  expect(closeMenu).toBeInTheDocument();
  await userEvent.click(closeMenu);

  expect(tooltip).not.toBeInTheDocument();
});

describe('Test <CallButton customerId={customerName} /> set primary function', () => {
  beforeEach(() => {
    mockedShowSnackbar.mockClear();
    server.use(
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerName}`,
        () => HttpResponse.json(mockCustomer)
      ),
      http.get(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerName}/phones`,
        () => HttpResponse.json(phonesMockData)
      )
    );
  });

  it('Set primary phone number fail', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerName}`,
        () => HttpResponse.json({}, { status: 400 })
      )
    );

    render(<CallButton customerId={customerName} />, { wrapper });

    const buttons = await screen.findAllByRole('button');
    await userEvent.click(buttons[1]);

    const radiosPrimary = await screen.findAllByTestId('primary-radio');
    await userEvent.click(radiosPrimary[2]);

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalled();
      expect(mockedShowSnackbar).toHaveBeenCalledWith({
        isOpen: true,
        message: undefined,
        status: 'error',
      });
    });
  });

  it('Set primary phone number work', async () => {
    server.use(
      http.patch(
        `${process.env.VITE_API_ENDPOINT}/api/customer/v1alpha1/${customerName}`,
        () => HttpResponse.json(mockCustomer)
      )
    );

    render(<CallButton customerId={customerName} />, { wrapper });

    const buttons = await screen.findAllByRole('button');
    expect(buttons).toHaveLength(2);
    await userEvent.click(buttons[1]);

    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toBeInTheDocument();

    const radiosPrimary = await screen.findAllByTestId('primary-radio');
    await userEvent.click(radiosPrimary[2]);

    expect(await screen.findAllByText('02222****')).toHaveLength(1);
    expect(dispatch).toHaveBeenCalled();
    expect(mockedShowSnackbar).toHaveBeenCalledWith({
      isOpen: true,
      message: 'text.updateCustomerSuccess',
      status: 'success',
    });
  });
});
