import userEvent from '@testing-library/user-event';
import React from 'react';

import { render, screen, waitFor } from '__tests__/rtl-test-utils';

import CreateUser from './CreateUser';

var mockShowError: jest.Mock;
var mockShowSuccess: jest.Mock;
var mockUnrwap = jest.fn().mockResolvedValue({
  recoveryLink: 'some_recovery_link',
  expiresAt: '2023-10-03T04:52:35.247Z',
});

const mockUser = {
  name: 'users/93717ece-de01-4988-8d07-b37f249418eb',
  createTime: '6/30/2023',
  updateTime: '6/30/2023',
  deleteTime: null,
  createBy: 'users/8c748759-bd15-4ed8-8697-cec40cb9cbad',
  humanId: 'Testing_00008@rabbit.com',
  role: 'roles/sales',
  firstName: 'AutoAssign',
  lastName: 'Demo8',
  fullName: 'AutoAssign Demo8',
  annotations: {
    daily_limit: '8',
    lang: 'TH',
    score: '4',
    total_limit: '250',
  },
  loginTime: null,
  createByFirstName: 'Citra Parameswari',
  createByLastName: '-',
  createByFullName: 'Citra Parameswari -',
  teamProduct: 'Car Insurance',
  teamDisplayName: 'Auto assign',
  score: '4',
  displayRole: 'Sales Agent',
  status: 'Active',
  time: 1696236222363,
};

jest.mock('data/slices/userSlice', () => ({
  ...jest.requireActual('data/slices/userSlice'),
  useLazyGetUserRecoveryLinkQuery: jest.fn().mockReturnValue([
    jest.fn().mockImplementation(() => ({
      unwrap: mockUnrwap,
    })),
    {
      isLoading: false,
      isSuccess: true,
    },
  ]),
}));

jest.mock('utils/snackbar', () => {
  mockShowError = jest.fn();
  mockShowSuccess = jest.fn();
  return jest.fn().mockReturnValue({
    showErrorSnackbar: mockShowError,
    showSuccessSnackbar: mockShowSuccess,
  });
});

const mockWriteText = jest.fn().mockImplementation(() => Promise.resolve());
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

test('Should recover link response', async () => {
  render(<CreateUser user={mockUser} isEdit />);

  const recoveryLinkBtn = screen.getByTestId('recovery-link-button');
  expect(recoveryLinkBtn).toBeInTheDocument();

  userEvent.click(recoveryLinkBtn);
  await waitFor(() => {
    expect(mockWriteText).toHaveBeenCalled();
    expect(mockShowSuccess).toHaveBeenCalled();
  });
});

test('Should recover link invalid', async () => {
  mockUnrwap = jest.fn().mockResolvedValue({});
  render(<CreateUser user={mockUser} isEdit />);

  const recoveryLinkBtn = screen.getByTestId('recovery-link-button');
  expect(recoveryLinkBtn).toBeInTheDocument();

  userEvent.click(recoveryLinkBtn);
  await waitFor(() => {
    expect(mockShowError).toHaveBeenCalled();
  });
});
