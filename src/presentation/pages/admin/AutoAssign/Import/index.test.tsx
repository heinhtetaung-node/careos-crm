import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '__tests__/rtl-test-utils';

import AutoAssignImportPage from '.';

describe('Testing ImportConfig Modal', () => {
  it('should render SalesAgent Component', () => {
    render(<AutoAssignImportPage />);
    expect(screen.getByTestId('test-config-import-page')).toBeInTheDocument();
  });
  it('should popup settings modal and close it by cancel button', async () => {
    const { queryByRole } = render(<AutoAssignImportPage />);
    await userEvent.click(
      screen.getByRole('button', {
        name: 'menu.autoAssignment.root menu.autoAssignment.import',
      })
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await userEvent.click(
      screen.getByRole('button', { name: 'text.cancelButton' })
    );
    await waitForElementToBeRemoved(screen.getByRole('dialog'));
    expect(queryByRole('dialog')).toBeNull();
  });
  it('should popup settings modal and close it by close button', async () => {
    const { queryByRole } = render(<AutoAssignImportPage />);

    await userEvent.click(
      screen.getByRole('button', {
        name: 'menu.autoAssignment.root menu.autoAssignment.import',
      })
    );

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByTestId('close-button'));

    await waitForElementToBeRemoved(screen.getByRole('dialog'));
    expect(queryByRole('dialog')).toBeNull();
  });
});
