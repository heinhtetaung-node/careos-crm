import user from '@testing-library/user-event';
import React from 'react';

import { fireEvent, render, screen, waitFor } from '__tests__/rtl-test-utils';

import ImportCustomerProfilePageHelper from '.';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => mockDispatch,
}));
const CustomerImportData = `careos_cus_id,id,gender,firstname,lastname,email,date_of_birth,phone,company_name,force_create
,1129330,M,Test,Test,"""citrap@rabbit.co.th""",1982-06-30,"""0999999999""",,Y`;

describe('<CustomerProfilePage Component/>', () => {
  beforeEach(() => {
    render(<ImportCustomerProfilePageHelper />);
  });
  it('will be mounted correctly', () => {
    expect(
      screen.getByRole('button', { name: 'customerProfile.import' })
    ).toBeInTheDocument();
  });

  it('should update the table on CSV upload', async () => {
    await user.click(
      screen.getByRole('button', { name: 'customerProfile.import' })
    );

    const input = screen.getByTestId('file-drop-input');
    const blob = new Blob([CustomerImportData]);
    const file = new File([blob], 'demo-file.csv', {
      type: 'text/csv',
    });

    File.prototype.text = jest.fn().mockResolvedValueOnce(CustomerImportData);
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByTestId('select-file_type')).toBeEnabled();
      fireEvent.change(screen.getByTestId('select-file_type'), {
        target: { value: '1' },
      });
    });

    const importBtn = await screen.findByRole('button', {
      name: 'text.confirmImport',
    });

    await waitFor(async () => {
      expect(importBtn).toBeInTheDocument();
      await user.click(importBtn);
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});
