import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '__tests__/rtl-test-utils';

import AutoAssignImportPage from '.';

describe('Testing MassLEadImport Modal', () => {
  it('should render MassLead Component', () => {
    render(<AutoAssignImportPage />);
    expect(screen.getByTestId('test-mass-import-page')).toBeInTheDocument();
  });

  it('should popup settings modal and close it by cancel button', async () => {
    render(<AutoAssignImportPage />);
    userEvent.click(
      screen.getByRole('button', {
        name: 'menu.autoAssignment.massLeadImport',
      })
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'text.cancelButton' })
    );
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should popup settings modal and close it by close button', async () => {
    render(<AutoAssignImportPage />);

    await userEvent.click(
      screen.getByRole('button', {
        name: 'menu.autoAssignment.massLeadImport',
      })
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('close-button'));

    await waitForElementToBeRemoved(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
