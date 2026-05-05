import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import Header from './Header';

var mockedFn: jest.Mock;

// Mock routes to avoid circular dependency issues
jest.mock('presentation/routes', () => ({
  sidebar: [],
  healthSidebar: [],
  travelSidebar: [],
}));

jest.mock('shared/constants/headerRoutes', () => ({
  __esModule: true,
  default: [
    {
      id: 1,
      icon: '',
      path: '/leads/my-leads',
      text: 'text.myLead',
    },
    {
      id: 3,
      icon: '',
      path: '#',
      type: 'appointment',
      text: 'text.myAppointment',
    },
  ],
  myOrderRoute: {
    id: 2,
    icon: '',
    path: '/orders/my-orders',
    text: 'text.myOrder',
  },
  comissionReportRoute: {
    id: 4,
    icon: '',
    path: '/commission-report',
    text: 'text.commissionReport',
  },
  emptyHeaderRoutes: [],
  healthHeaderRoutes: () => [],
}));

const initialState = {
  headerLayoutReducer: {
    params: true,
  },
};

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest
    .fn()
    .mockReturnValue({ data: { role: 'roles/sales', name: 'user-1213' } }),
}));

jest.mock('presentation/redux/actions/languages', () => {
  mockedFn = jest.fn(() => ({
    type: '[Language] CHANGE_LANGUAGE',
    payload: 'th',
  }));

  return {
    ...jest.requireActual('presentation/redux/actions/languages'),
    changeLanguage: mockedFn,
  };
});

describe('Header', () => {
  it.skip('should show appointment modal if clicked myAppointment', async () => {
    render(<Header />, { initialState });
    await userEvent.click(screen.getByText('text.myAppointment'));
    const modal = within(screen.getByRole('presentation'));
    expect(modal.getByTestId('appointment-modal')).toBeInTheDocument();
    await userEvent.click(screen.getByTestId('appointment-close-x'));
    expect(modal.queryByTestId('appointment-modal')).not.toBeInTheDocument();
  });

  it('should open language modal and change the language', async () => {
    render(<Header />, { initialState });

    await userEvent.click(screen.getByTestId('languageBtn'));

    const languageModal = screen.getByTestId('menu-appbar');
    expect(languageModal).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole('menuitem')[1]);

    expect(mockedFn).toHaveBeenCalledWith('th');
  });
});
