import React from 'react';

import { render, screen, within } from '__tests__/rtl-test-utils';

import userEvent from '@testing-library/user-event';

import AccountingMassStatus from '.';

jest.mock('data/slices/authSlice', () => ({
  useGetAuthenticateQuery: jest
    .fn()
    .mockReturnValue({ data: { role: 'roles/admin', name: 'user-1213' } }),
}));

describe('Testing Accounting Mass status change page', () => {
  it('should render mass status table', async () => {
    render(<AccountingMassStatus />);
    expect(screen.getByTestId('accounting-mass-status-change-page'));

    const btn = await screen.findByText(
      'menu.accounting.importPremiumRemittanceStatus'
    );
    expect(btn).toBeInTheDocument();

    // click btn to open ImportModal
    await userEvent.click(btn);
    const importModal = screen.getByRole('dialog');
    expect(importModal).toBeInTheDocument();
    expect(
      within(importModal).getByText('text.cancelButton')
    ).toBeInTheDocument();
    expect(
      within(importModal).getByText('text.confirmImport')
    ).toBeInTheDocument();
  });
});
